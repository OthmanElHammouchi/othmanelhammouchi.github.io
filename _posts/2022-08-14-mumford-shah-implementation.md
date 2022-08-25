---
layout: post
title:  "Coding up an image segmentation algorithm using Python"
subtitle: "Variational image segmentation - part 3"
date:   2022-08-14 16:43:55 +0200
---

*This is the final article in my series on variational image segmentation with the Mumford-Shah functional. The previous parts can be found [here]({% post_url 2022-08-14-mumford-shah-intro %}) and [here]({% post_url 2022-08-14-mumford-shah-theory %}).*

In the previous article, we discussed the challenges with the numerical implementation of the Mumford-Shah functional and defined a series of approximations which allow us to overcome them. This allowed us in turn to derive the Euler-Lagrange PDEs

$$
\begin{cases}
	\displaystyle
	(u - g) - \nabla \cdot (v^2 \nabla u) = 0 \\
	\displaystyle
	v \Vert \nabla u \Vert^2 - \frac{1 - v}{4\epsilon} - \epsilon \Delta v = 0
\end{cases}
$$

which we can solve to obtain a pair of approximations $(u_\epsilon, v_\epsilon)$. We have seen that as $\epsilon \to 0$, the corresponding approximations converge to $(u, I_K)$. All that remains for us, then, is to code this up. We'll use the [FEniCS](https://fenicsproject.org/) finite element library for Python, which allows us to write code very close to the original mathematics.

Let's begin by importing our image and mapping it onto 

{% highlight python %}

img = cv2.imread("image.png", cv2.IMREAD_GRAYSCALE)

Lx = float(img.shape[1])/float(img.shape[0])
Ly = 1.

mesh = RectangleMesh(Point(0,0),Point(Lx,Ly), 500, 500, "crossed")
V = FunctionSpace(mesh, "Lagrange", 1)
trueImage = Image(Lx, Ly, img)
g  = interpolate(trueImage, V)

eps = 1e-6
alpha = 1
beta = 1

cartoon = g

maxiter = 5
iter = 1
while iter <= maxiter:
	edges = solve_edges(cartoon, eps, V, alpha, beta)
	cartoon = solve_cartoon(edges, eps, g, V, beta)
	iter += 1
{% endhighlight %}