+++ 
draft = false
date = 2022-08-14T16:43:54+02:00
title = "Mumford Shah: Implementing the Algorithm"
description = ""
slug = ""
authors = ["Othman El Hammouchi"]
tags = ["image processing", "Python"]
categories = []
externalLink = ""
series = ["Mumford-Shah Image Segmentation"]
+++

In the previous article, we discussed the challenges with the numerical implementation of the Mumford-Shah functional and defined a series of approximations which allow us to overcome them. This allowed us in turn to derive the Euler-Lagrange PDEs

$$
\begin{cases}
	\displaystyle
	(u - g) - \nabla \cdot (v^2 \nabla u) = 0 \\\\[1em]
	\displaystyle
	v \Vert \nabla u \Vert^2 - \frac{1 - v}{4\epsilon} - \epsilon \Delta v = 0
\end{cases}
$$

which we can solve to obtain a pair of approximations $(u_\epsilon, v_\epsilon)$. We have seen that as $\epsilon \to 0$, the corresponding approximations converge to $(u, I_K)$. All that remains for us, then, is to code this up. We'll use the Python bindings for the [FEniCS](https://fenicsproject.org/) finite element library, as it allows us to specify the equations using its so-called *Unified Form Language* in a manner which is very close to the original mathematics.

In order to apply the finite element method, we first have to put our PDE into a different form called the *weak formulation*. This is achieved by multiplying both sides by a so-called *test function* and integrating on the domain:

$$
\begin{cases}
	\displaystyle
	\int_\Omega (u - g) \\, w \\, dx - \int_\Omega w \\, \nabla \cdot (v^2 \nabla u) \\, dx = 0 \\\\[2em]
	\displaystyle
	\int_\Omega w \\, v \Vert \nabla u \Vert^2 \\, dx + \frac{1}{4\epsilon}\int_\Omega w v\\, dx - \int_\Omega \epsilon \Delta v \\, w\\, dx = \frac{1}{4\epsilon} \int_\Omega w \\, dx \\,.
\end{cases}
$$

Then we integrate by parts to reduce by 1 the order of the highest derivative:

$$
\left\\{
    \begin{align}
        \int_\Omega (u - g) \\, w \\, dx - \int_\Omega v^2 \\, \nabla w \cdot \nabla u \\, dx &= 0 \label{eq:cartoon} \\\\[2em]
        \int_\Omega w \\, v \Vert \nabla u \Vert^2 \\, dx + \int_\Omega \frac{w \\, v}{4\epsilon} \\, dx - \int_\Omega \epsilon \nabla v \cdot \nabla w \\, dx &= \int_\Omega \frac{w}{4\epsilon} \\, dx \label{eq:edges} \\,.
    \end{align}
\right.
$$

Now let's get started on the implementation (all of the code for this series is available on [my github](https://github.com/OthmanElHammouchi/mumford-shah)). First, we'll import the image from the [introduction]({{< ref "/posts/mumford-shah-intro" >}}) using OpenCV, which will give us a `numpy` array with the pixel values. We then compute width and height values for our mesh such that the image is resized to have unit height.

{{< highlight python >}}

image = cv2.imread(os.path.join("data", "image", "per-enflo-goose.png"))
Lx = float(image.shape[1]) / float(image.shape[0])
Ly = 1.0
hx = Lx / float(image.shape[1] - 1)
hy = Ly / float(image.shape[0] - 1)

{{< /highlight >}}

Next, we'll create a rectangular mesh domain, which represents $\Omega$ in our equations.

{{< highlight python >}}

ELEMS = 500  # per unit of length
domain = mesh.create_rectangle(
    MPI.COMM_WORLD,
    [[0, 0], [Lx, Ly]],
    [int(math.floor(Lx * ELEMS)), int(math.floor(Ly * ELEMS))],
)

{{< /highlight >}}

To actually get the image onto the mesh, we need to define a `FunctionSpace`, create a function `g`, and `interpolate` the image into this. The helper function `image_fun` maps the points $(x, y)$ in $\Omega$ to the corresponding point in the image array. Notice that we need to reverse the indices, as a row of the image array will give the values at a particular y-value of the domain.

{{< highlight python >}}

def image_fun(x):
    global hx, hy
    res = np.zeros((3, x.shape[1]))
    for k in range(x.shape[1]):
        j = int(math.floor(x[0, k] / hx))
        i = int(math.floor((Ly - x[1, k]) / hy))
        res[:, k] = image[i, j, :]
    return res


U = fem.FunctionSpace(domain, ("Lagrange", 1, (3,)))
V = fem.FunctionSpace(domain, ("Lagrange", 1))
g = fem.Function(U)
g.interpolate(image_fun)

{{< /highlight >}}

Now we get to the meat of the code, solving the PDE system. In UFL, equations \ref{eq:cartoon} and \ref{eq:edges} can be written represented as

{{< highlight python >}}

    a = (
        dot(grad(u), grad(u)) * v * w * dx
        - eps * dot(grad(v), grad(w)) * dx
        + 1 / (4 * eps) * v * w * dx
    )
    L = fem.Constant(domain, 1 / (4 * eps)) * w * dx

{{< /highlight >}}

and

{{< highlight python >}}

    L = g * w * dx
    a = u * w * dx + (v**2) * dot(grad(u), grad(w)) * dx

{{< /highlight >}}

respectively. We will solve the system by iteratively alternating between the two equations: taking $u = g$ as our starting point, we will solve each one in turn while fixing the other variable to the previous solution we obtained. Let's write a pair of helper functions to define and solve these subproblems:

{{< highlight python >}}

def grayscale_edges(u, eps, V):
    global domain
    v = TrialFunction(V)
    w = TestFunction(V)

    a = (
        dot(grad(u), grad(u)) * v * w * dx
        - eps * dot(grad(v), grad(w)) * dx
        + 1 / (4 * eps) * v * w * dx
    )
    L = fem.Constant(domain, 1 / (4 * eps)) * w * dx

    v = fem.Function(V)
    problem = LinearProblem(
        a, L, petsc_options={"ksp_type": "preonly", "pc_type": "lu"}
    )
    vh = problem.solve()
    return vh


def grayscale_cartoon(v, g, V):
    u = TrialFunction(V)
    w = TestFunction(V)

    L = g * w * dx
    a = u * w * dx + (v**2) * dot(grad(u), grad(w)) * dx

    u = fem.Function(V)
    problem = LinearProblem(
        a, L, petsc_options={"ksp_type": "preonly", "pc_type": "lu"}
    )
    uh = problem.solve()
    return uh
{{< /highlight >}}

The segmentation can now be implemented in a while loop:

{{< highlight python >}}

def segment_image(g, V, eps, maxiter=5):
    u = g
    iter = 1
    while iter <= maxiter:
        v = grayscale_edges(u, eps, V)
        u = grayscale_cartoon(v, g, V)
        iter += 1
    return u, v

{{< /highlight >}}

In order to extract the segmentation images from the solution, we unfortunately have to do some very inelegant gymnastics. This is owing to the newer versions of FEniCS having removed the utility functions for evaluating the function at the mesh nodes -- an earlier version of this code extracted the data with a simple oneliner. Unfortunately, this is one of the big shortcomings of the framework: it has a very unstable API which gets breaking changes quite frequently, and the documentation is very succint. I don't want to criticise it too harshly though, it's still volunteer-based FOSS.

{{< highlight python >}}

points = domain.geometry.x
points = points[
    np.lexsort(
        (points[:, 0], -points[:, 1])
    )  # Ensures correct orientation for plt.imshow
]

bb_tree = geometry.bb_tree(domain, domain.topology.dim)
cell_candidates = geometry.compute_collisions_points(bb_tree, points)
colliding_cells = geometry.compute_colliding_cells(domain, cell_candidates, points)

cells = []
points_on_proc = []
for i, point in enumerate(points):
    if len(colliding_cells.links(i)) > 0:
        points_on_proc.append(point)
        cells.append(colliding_cells.links(i)[0])
points_on_proc = np.array(points_on_proc, dtype=np.float64)

comps = list(u.split())
comps = [comp.eval(points_on_proc, cells).reshape((ELEMS + 1, -1)) for comp in comps]
for i in range(len(comps)):
    comps[i] = np.abs(comps[i].min()) + comps[i]
    comps[i] = 255 * comps[i] / comps[i].max()
    comps[i] = comps[i].astype(np.uint8)

cartoon = np.stack(
    comps,
    axis=-1,
)

edges = v.eval(points_on_proc, cells).reshape((ELEMS + 1, -1))
edges = np.abs(edges.min()) + edges
edges = 255 * edges / edges.max()
edges = edges.astype(np.uint8)

{{< /highlight >}}

Finally, we write out the results to disk,

{{< highlight python >}}

plt.imsave(
    os.path.join("results", "colour_cartoon.png"),
    cv2.cvtColor(cartoon, cv2.COLOR_BGR2RGB),
)
plt.imsave(os.path.join("results", "colour_edges.png"), edges, cmap="grey")

{{< /highlight >}}

and gaze upon the fruits of our labour:

{{% image-pair caption="Segmentation of the legendary picture of Per Enflo's goose award ceremony" first="grayscale_cartoon.png" second="grayscale_edges.png" %}}