---
layout: post
title:  "Mumford-Shah Image Segmentation - Introduction"
date:   2022-08-14 16:43:53 +0200
---

*This is the first in a series of articles about the Mumford-Shah model for variational image segmentation.*

Segmentation is the process of partitioning an image into a set of regions representing different surfaces and determining the contours which seperate them. This results in a simplified representation (often called a cartoon) which can then be used in all manner of downstream tasks, from medical imaging tools for assisting physicians to computer vision models. The power of image segmentation (as with all data science applications) lies in its ability to condense information, reducing a high-dimensional input with lots of superfluous detail to a streamlined representation which can be more easily parsed and processed. Every segmentation model is fundamentally defined by how it chooses to make this tradeoff between accuracy and parsimony. 

In this series of posts, we'll take a look at the model proposed by mathematicians David Mumford and Jayant Shah in one of the most cited papers in the image processing literature. It belongs to the family of so-called variational methods, which operate by minimising an energy functional on a space of candidate solutions (don't worry, we'll elaborate on this later). A major benefit of this approach in comparison with more recent neural network-based ones is that it requires no labelled training data, which can be difficult and costly to obtain, especially in specialised fields such as medicine. To get you excited for the math (which can be fairly heavy-duty in places), here's a sneak peek at the final result:

<figure>
	<div class="multi-image">
		<img src="/assets/images/image.png">
	</div>
	<figcaption>Original image</figcaption>
</figure>

<figure>
	<div class="multi-image">
		<img src="/assets/images/edges.png">
		<img src="/assets/images/cartoon.png">
	</div>
	<figcaption>Segmentation</figcaption>
</figure>

Looks pretty cool, huh? This segmentation of [Per Enflo's famous goose award ceremony](https://perenflo.com/math) was done using a numerical implementation of the Mumford-Shah model in Python, which we'll build up to in this and the next post.

To keep things simple, let's restrict our attention to grayscale images for starters. An image is then simply a function $g: \Omega \underset{\mathclap{\mathrm{open}}}{\subseteq} \mathbb{R}^2 \rightarrow \mathbb{R}$ which returns the light intensity at each point of a flat display. This display can be any bounded open subset of the plane, and we can choose $\Omega = [0, 1]^2$ for simplicity. The values which g assumes depend on the (arbitrary) scale used, and so may be normalised to lie between 0 and 1. Of course, in actual implementations, $g$ will be constrained to a discrete set of values depending on the bit-depth of the image, but this special case is included in the more general setting. Because real-life images typically are extremely erratic, we cannot place any restrictions on $g$ at this stage: it's allowed to be as irregular and ill-behaved as may be.

A segmentation of $g$ will be another image $u$ which approximates the original as closely as possible, while satisfying certain restrictions which constrain it to be a cartoon. The proximity requirement can be expressed by penalising the $L^2$-norm of the difference $\int_{\Omega}(u - g)^2 \\, dx$, with the choice of norm motivated as usual by optimisation considerations. In order to obtain a cartoon of the original, we need $u$ to smooth out the interior of surfaces while preserving the boundary between them. In other words, it should be a regular function outside of an edge set $K \underset{\mathclap{\mathrm{closed}}}{\subseteq} \Omega$ where it makes a sudden jump. The challenging part is how to differentiate abrupt intra-surface variations from real transitions. 

The Mumford-Shah approach tackles this problem by introducing both the norm $\Vert \nabla u \Vert$ of the gradient as well as the length $\mathcal{H}^1(K)$ of the discontinuity set as additional regularising penalty terms (here $\mathcal{H}^1$ denotes the 1-dimensional Hausdorff measure, a generalisation of the notion of length to irregular curves such as fractals). The idea is to force $u$ to have singularities only where they are 'most needed'. To illustrate this, consider the following two sigmoid-like surfaces:

Both make a transition from 1 to 0, but the one on the left does so much more gently. If these represented the images we were cartooning, then choosing $u \coloneqq g$ would incur a much greater penalty for the right mapping than the left, because of a blowup in the gradient term. Introducing a jump discontinuity along the line where the sharp drop-off occurs and taking $u$ to be an (almost) piecewise constant function would probably lead to an improvement in the penalty. 

Putting these three terms together, we are now able to fully state the Mumford-Shah model. For a given image $g$, its segmentation and edge set are obtained as the pair $(u, K) \in C^1(\Omega \setminus K) \times \mathcal{F}(\Omega)$ which minimises the *Mumford-Shah functional*

$$
J[u, K] := \int_{\Omega}(u - g)^2 \\, dx + \int_{\Omega \setminus K}\left \Vert \nabla u \right \Vert ^2 \\, dx + \mathcal{H}^1(K) \\,.
$$

The term "functional" is simply a fancy name given to a function which takes other functions as inputs. The Riemann integral from elementary calculus is an example of a functional: it maps functions $f \in C([a, b])$ to the real number $\int_a^b f(x) \\, dx$. Finding minimisers of functionals is well-established problem within mathematics and is 
the subject of a field called *variational calculus* (the reason for this naming will become clear in the next post). 

Of course, we have yet to show the actual existence of a minimising pair for the Mumford-Shah functional, without which our segmentation definition would be entirely vacuous. This turns out to be a rather hard problem, requiring a lot of involved mathematical machinery to tackle. If you're interested in the technical details, they were the subject of my undergraduate thesis, which you can find [here]({{ site.url }}/assets/mumford_shah_thesis.pdf) if you're feeling adventurous. 

The topic is not just of theoretical interest either: if you want to maintain your sanity when writing a software implementation of this algorithm, it's quite helpful to know that your solver's failure to convergence is caused by a bug, and not because it's searching for something which doesn't exist. A famous example of a functional without minimiser is due to Weierstrass:

$$
J[u] = \int_{-1}^1 (t \frac{du}{dt})^2 \\, dt
$$

defined on the class of functions

$$
\mathcal{A} := \left \lbrace u \in C^1((-1, 1)) \mid u(-1) = -1, u(1) = 1 \right \rbrace
$$

It is clear that $J[u] \geq 0$ for any $u$. Moreover, it can be shown that $J[u_\epsilon] \xrightarrow{\epsilon \to 0} 0$ for the sequence

$$
u_{\epsilon}(t) := \frac{\arctan(t/\epsilon)}{\arctan(1/\epsilon)}
$$

as illustrated numerically in the following animation:

<div style="display: flex; justify-content: center;">{{< include-html "dirichlet.html" >}}</div>

Thus, we can conclude that $\underset{u \in \mathcal{A}}{\inf}J(u)$ = 0, but this value is never attained, because any minimiser of $J$ must have a constant derivative equal to 0, and thus cannot take on different values at the endpoints. Looking at how the shape of $u_\epsilon$ evolves, we can see that its slope becomes steeper and steeper as it concentrates around 0 in an attempt to minimise the derivative on the rest of its domain. 

This example also illustrates a common reason why functionals can fail to have a minimiser. 

If we allowed this process reach its "natural conclusion", we would exit the original space and obtain a step function with a jump at the origin. In other words, to obtain a solution, we have to *relax* the problem to impose *fewer constraints on the candidate solutions*, expanding the domain of $J$ to include piecewise differentiable candidate functions. Solutions obtained in this way are called *weak solutions*. We usually take the largest function space for which the problem remains well-defined in order to have maximal leeway in our search. If we succeed in finding a solution, our task then becomes to show that it is *regular*, i.e. that it satisfies the constraints of the original problem. An additional benefit of this approach is that it allows us to treat the two components seperately.

In the next post, we'll start putting this theoretical framework to some practical use by deriving the equations necessary for numerical minimisation of the Mumford-Shah functional.