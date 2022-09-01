---
layout: post
title:  "Introduction to the Mumford-Shah functional" 
subtitle: "Variational image segmentation - part 1"
date:   2022-08-14 16:43:55 +0200
---

*This is the first in a series of articles exploring the Mumford-Shah model in variational image segmentation.*

Image segmentation is the process of partitioning a given input image into a collection of contiguous *regions* representing different objects. It gives us a simpler representation of the original data which can be used downstream for all kinds of tasks, ranging from medical imaging to computer vision to restoration and inpainting. Many different segmentation models have been developed over the years, each having their own particular strenghts and weaknesses. The approach I want to explore in this series of articles belongs to the family of so-called *variational methods*, which are based on the mathemetical subfield of *functional analysis*. Devised by mathematicians David Mumford and Jayant Shah in 1989, it has since inspired many other techniques in the field, most notably the Chan-Vese model. One of its major perks is that it allows us smooth away noise and irrelevant details while preserving edges. We'll set up the model and derive the associated equations which we have to solve. Finally, we'll show how this can all be implemented numerically in Python. To wet your appetite, here's an example of the end result.

<figure>
	<div class="multi-image">
		<img src="/assets/img/image.png">
	</div>
	<figcaption>Original image</figcaption>
</figure>

<figure>
	<div class="multi-image">
		<img src="/assets/img/edges.png">
		<img src="/assets/img/cartoon.png">
	</div>
	<figcaption>Segmentation</figcaption>
</figure>


Looks pretty cool, huh? Excited? Let's dive right in!

In order to properly frame our problem, we'll first need to come up with a mathematical model for it. We can restrict our attention initially to grayscale images to keep things simple - the generalisation to the colour case will turn out to be quite straightforward later on. An image can then be viewed as a function $g$ returning a light intensity (normalised between 0 and 1) at every point of a square display, which we identify with the unit square $\Omega = [0, 1]^2$. No prior restrictions are placed on $g$: it's allowed to be as irregular and ill-behaved as it wants. 

We segment this image by looking for a mapping $u: \Omega \rightarrow [0, 1]$ close to $g$ which is smooth outside of a 1-dimensional *edge set* $K$, i.e. $u \in C^1(\Omega \setminus K)$. This proximity requirement can be expressed by minimising $\Vert u - g \Vert_2$, the $L^2$-norm of the difference, which has the advantage of being convex, making optimisation a lot easier. To approximate the contiguous regions of $g$, we want to force $u$ to vary slowly inside each connected component of $\Omega \setminus K$, maintaining an approximately constant value. The change of a multivariate function is measured by the magnitude of its gradient, and we therefore want $\Vert \nabla u \Vert_2$ to be small. Finally, to avoid a proliferation of singularities, we want $K$ to only include the most "important" or "interesting" edges. We can achieve this by minimising its so-called *Hausdorff measure* $\mathcal{H}^1(K)$, which generalises the notion of length to irregular sets such as fractals. Putting these three constraints together, our goal then is to find a pair $(u, K)$ which minimises the *Mumford-Shah functional*

$$
J[u, K] := \int_{\Omega}(u - g)^2 \, dx + \int_{\Omega \setminus K}\left \Vert \nabla u \right \Vert ^2 \, dx + \mathcal{H}^1(K) \,.
$$

If you find this expression daunting, remember that there's nothing new here: each of the 3 terms corresponds to one of the conditions described above, and "functional" is simply a fancy name we give to a function which takes *other functions* as input. The Riemann integral from elementary calculus is an example of a functional: it maps functions $f \in C([a, b])$ to the real number $\int_a^b f(x) \, dx$. Finding minimisers of functionals is well-established problem within mathematics and is the subject of a field called *variational calculus*. 

When studying a variational problem, the first thing we want to know is whether there exist any solutions at all. If you are of a more pragmatic bent, you may be inclined to regard such theoretical questions with suspicion, preferring to skip straight to the numerical implementation instead. We need to make sure, however, that the discrete results we compute on our machines are *actually* approximating something. It's somewhat difficult to provide error estimates for our approximations when we're unsure whether the benchmark we're comparing them to does, in fact, exist.

To further illustrate this point, allow me to tell you a little anecdote from math history. For the greater part of the 19th century, it was a commonly held belief among mathematicians that one could solve the Dirichlet boundary value problem for the Laplace equation,

$$
\begin{cases}
\Delta u = 0 \quad \text{in} \ \Omega \\
u = 0 \quad \text{on} \ \partial D\,
\end{cases}
$$

by minimising the variational integral

$$
\int_{\Omega} \Vert \nabla u \Vert^2 \, dx \,.
$$

Riemann named this idea "Dirichlet's principle" after his teacher, and tried to use it to prove his famous mapping theorem. He was challenged in this by Weierstrass, however, who cast doubt on the assumption, implicit in Riemann's reasoning, that any functional which is bounded from below must have a minimiser. As a counterexample, he proposed the mapping

$$
\begin{equation}
J[u] = \int_{-1}^1 (t \frac{du}{dt})^2 \, dt \,,
\end{equation}
$$

defined on the class of functions $\mathcal{A} := \left \lbrace u \in C^1((-1, 1)) \ \vert \ u(-1) = -1, u(1) = 1 \right \rbrace$. Clearly $J[u] \geq 0$ for any $u$. Moreover, it can be shown that $J[u_\epsilon] \xrightarrow{\epsilon \to 0} 0$ for the sequence

$$
u_{\epsilon}(t) := \frac{\arctan(t/\epsilon)}{\arctan(1/\epsilon)} \,,
$$

as illustrated in the animation below.

<div style="display: flex; justify-content: center;">{% include dirichlet.html%}</div>

We conclude that $\underset{u \in \mathcal{A}}{\inf}J(u)$. This infimum is never attained, however, as any minimiser $u$ of (1) must have constant derivative equal to 0, and thus cannot take on different values at the endpoints. Looking at how the shape of $u_\epsilon$ evolves, we see that its slope becomes ever more steeply concentrated around 0 as it tries to minimise its derivative on the rest of its domain. 

If we allowed this process reach its "natural conclusion", we would exit the original space and obtain a step function with a jump at the origin. In other words, to obtain a solution, we have to *relax* the problem to impose *fewer constraints on the candidate solutions*, expanding the domain of $J$ to include piecewise differentiable candidate functions. Solutions obtained in this way are called *weak solutions*. We usually take the largest function space for which the problem remains well-defined in order to have maximal leeway in our search. If we succeed in finding a solution, our task then becomes to show that it is *regular*, i.e. that it satisfies the constraints of the original problem. An additional benefit of this approach is that it allows us to treat the two components seperately.

The go-to theorem for proving existence results for variational problems is the so-called *direct method*, which guarantees that there is a solution if the functional and the underlying space are nice enough. The challenge is find a relaxation which satisfies these conditions. The details of this are very technical and *way* outside the scope of this post. If you're interested in the nitty-gritty, however, you can find them in [my undergraduate thesis]({{ site.url }}/assets/mumford_shah_thesis.pdf).

Stay tuned for part 2, where we'll derive the necessary equations to actually implement the Mumford-Shah minimisation problem using the finite element method.

