---
layout: post
title:  "Introduction to the Mumford-Shah functional" 
subtitle: "Variational image segmentation - part 1"
date:   2022-08-14 16:43:55 +0200
---

*This is the first in a series of articles exploring the Mumford-Shah model in variational image segmentation.*

Image segmentation is the task of seperating a given input image into two parts: a collection of contiguous *regions* corresponding to objects and other surfaces, and a set of *edges* giving the boundaries between them. It has a great number applications, ranging from medical imaging to computer vision to inpainting. Many different segmentation models have been developed over the years, each having their own particular strenghts and weaknesses. The approach which we will be exploring in this series of articles belongs to the family of so-called *variational methods*, which rely on results from functional analysis. Devised by the mathematicians David Mumford and Jayant Shah in 1989, it has the distinct advantage of being edge-preserving.

This series consists of 3 parts. The present article serves as a gentle introduction to variational image segmentation by way of the Mumford-Shah framework. In the next article, I will dive more deeply into the theory behind this method. Lastly,  we'll take a look at an implementation of Mumford-Shah segmentation using the FEniCS library in Python. To wet the reader's appetite, here's an example of the final result.

![Stanislaw Mazur presents Per Enflo with a goose](/assets/img/image.png) \\
<span>Original image</span>{:style="color:grey; font-size:small"}
{:style="display:block; margin:35px; text-align:center"}

<div style="overflow: auto">
	<div style="float: left; width: 45%">
		<img src="/assets/img/cartoon.png">
	</div>
	<div style="float: right; width: 45%">
		<img src="/assets/img/edges.png">
	</div>
	<div style = "padding-top: 10px">
		<p style="color:grey; font-size:small">Segmentation</p>
	</div>
</div>{:style="display:block; margin:35px; text-align:center"}

Looks pretty cool, huh? Have I got you excited? Then let's dive right in!

I've already mentioned previously that Mumford-Shah segmentation is based on *functional analysis*. So what is a functional? A functional is simply a fancy name we give to a function which takes other functions as input. The Riemann integral from elementary calculus is an example of a functional: it maps continuous functions $f \in C([a, b])$ defined on an interval to a real number number $\int_a^b f(x) \, dx$. A similar statement holds for the ordinary derivative $\frac{d}{dx}$. This more abstract view of these basic calculus operations turns out to be valuable in many applications, especially for solving (partial) differential equations. To see how it factors into image segmentation, we will first have to formulate a proper model for our problem.

Let' assume, for the time being, that we're working with grayscale images on a square display, which we can identify with the unit square $\Omega = [0, 1]^2$. An image can be viewed as a function $g$ returning a light intensity (normalised between 0 and 1) at every point of $\Omega$. A priori, we place no restrictions on $g$: it's allowed to be as irregular as one likes. Segmentation of this image is achieved by approximating it with a mapping $u: \Omega \rightarrow [0, 1]$, which must be smooth outside of a subset $K$ of $\Omega$. The function $u$ then represent the contiguous regions of $g$, exhibiting jumps on the edge set $K$ marking the transition between them. 

In order to find a suitable approximation, we impose 3 conditions. Firstly, as mentioned previously, $u$ is required to lie as close as possible to the original image. In order to make sure the resulting problem is convex (which greatly facilitates optimisation), we will express this proximity using the $L^2$-norm. Secondly, we want $u$ to be behave as regularly as possible outside of $K$, meaning that it is not allowed to change too fast. We can express this by requiring that $\Vert \nabla u \Vert$, the norm of the gradient of $u$, be as small as possible. Finally, we also want to penalise the length of the pathological set $K$.

We can put these requirements together by defining the functional

$$
J[u, K] := \int_{\Omega}(u - g)^2 \, dx + \int_{\Omega}\left \Vert \nabla u \right \Vert ^2 \, dx + \mathcal{H}^1(K) \,,
$$

and choosing for our segmentation the pair $(u, K)$ which minimises it. While this expression may look somewhat daunting on first glance, there's nothing new here: each of the 3 terms in $J$ corresponds to one of the conditions outlined above. 

The minimisation of functionals is an old and well-established problem within mathematics, and it is the subject of a field called the *variational calculus*. 

From a theoretical point of view, we want to know whether a minimiser of the functional actually *exist*. To answer this, we usually reformulate the problem in a way which imposes *as few constraints on the input functions as possible*. This allows us to look for so-called *weak solutions* (we'll explain what these are in a moment) in a much larger space, which tends to be easier. If we succeed in finding a solution, our task then becomes to show that it is *regular*, i.e. that it satisfies the constraints of the original problem. The nice thing about this approach is that the two components are independent, meaning we can reason about them seperately.

If you have a more pragmatic, application-oriented bent, you may be inclined to ask why we should be concerned with proving existence results. After all, the only concrete solution we're likely be able to compute will to be a discrete approximation (such as the finite element method we will use in at the end of this series). Couldn't we just skip all the pure math and get to the numerical implementation already? The flaw with this reasoning is that it is often possible to derive properties of the analytic solution by manipulation of the original equation without explicitly solving it, and these will often not be shared by the discretisation. For instance, an FEM approximation obtained using linear Lagrange elements will most likely not have a continuous derivative, even if the true solution does.

"That's all well and good", you might say, "but are there any actual examples of variational problems without a solution?". We'll answer this question with an anecdote from math history, which also nicely illustrates the need for the introduction of weak solutions. For the greater part of the 19th century, it was a commonly held belief among mathematicians that one could solve the Dirichlet boundary value problem for the Laplace equation,

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

Riemann named this idea "Dirichlet's principle" after his teacher, and used it to try to prove his famous mapping theorem. It was only in 1870 that he was challenged by Weierstrass, who cast doubt on the assumption, implicit in Riemann's reasoning, that any functional which is bounded from below must have a minimiser. As a counterexample, he proposed the mapping

$$
\begin{equation}
J[u] = \int_{-1}^1 (t \frac{du}{dt})^2 \, dt \,,
\end{equation}
$$

defined on the class of functions $\mathcal{A} := \left \lbrace u \in C^1([-1, 1]) \ \vert \ u(-1) = -1, u(1) = 1 \right \rbrace$. Clearly $J[u] \geq 0$ for any $u$. Moreover, it can be shown that $J[u_\epsilon] \xrightarrow{\epsilon \to 0} 0$ for the sequence

$$
u_{\epsilon}(t) := \frac{\arctan(t/\epsilon)}{\arctan(1/\epsilon)} \,,
$$

as illustrated numerically below.

<div>{% include dirichlet.html%}</div>

We conclude that $\underset{u \in \mathcal{A}}{\inf}J(u)$. This infimum is never attained, however, as any minimiser $u$ of (1) must have constant derivative equal to 0, and thus cannot take on different values at the endpoints of $\Omega$.

A look at how the shape of $u_\epsilon$ evolves as $\epsilon \to 0$ clearly reveals the problem.

The most straightforward method to show the existence of 

The proof of this is rather involved - so much so, in fact, that I dedicated most of my undergraduate thesis to it. If you're interested in the nitty-gritty, you can find it [here]({{ site.url }}/assets/mumford_shah_thesis.pdf).

