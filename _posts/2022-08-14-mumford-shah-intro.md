---
layout: post
title:  "Image segmentation with Mumford-Shah: Introduction"
date:   2022-08-14 16:43:55 +0200
---

Segmentation is an image processing task which consists of seperating an input image into two parts: a number of contiguous *regions*, which correspond to objects and other surfaces, and a set of edges *edges* giving the boundary between them. It has a great number applications, ranging from medical imaging to computer vision to inpainting. Many approaches have been developed over the years to tackle this problem, most recently involving the use of neural network-based techniques which have been gaining so much attention. The method we will be exploring in this series of articles, devised by Mumford and Shah in their 1989 paper, does not belong to the NN family, but instead to the much older group of so-called variational methods, which are based on results from functional analysis. 

One advantage which these methods have is that they are edge-preserving. #still need to complete this last section

This series consists of 3 parts. The present article serves as . The second 

Finally,  give 

In order to give the reader some motivation to plough through the theory, however, we  

![Stanislaw Mazur presents Per Enflo with a goose](/assets/image.png){:style="display:block; margin-left:auto; margin-right:auto"}

text text

![Regions](/assets/cartoon.png) ![Edges](/assets/edges.png) 

Functional analysis is the mathematical subfield concerned with the study of (surprise!) *functionals*. A functional is simply a fancy name we give to a function which takes other functions as input. The Riemann integral from elementary calculus is an example of a functional: it maps continuous functions $f \in C([a, b])$ defined on an interval to a real number number $\int_a^b f(x) \, dx$. A similar statement holds for the ordinary derivative $\frac{d}{dx}$. This more abstract view of these basic calculus operations turns out to be valuable in many applications, especially for solving (partial) differential equations. To see how it factors into image segmentation, we will first have to formulate a proper model for our problem.

Let' assume, for the time being, that we're working with grayscale images on a square display, which we can identify with the unit square $\Omega = [0, 1]^2$. An image can be viewed as a function $g$ returning a light intensity (normalised between 0 and 1) at every point of $\Omega$. A priori, we place no restrictions on $g$: it's allowed to be as irregular as one likes. Segmentation of this image is achieved by approximating it with a mapping $u: \Omega \rightarrow [0, 1]$, which must be smooth outside of a subset $K$ of $\Omega$. The function $u$ then represent the contiguous regions of $g$, exhibiting jumps on the edge set $K$ marking the transition between them. 

In order to find a suitable approximation, we impose 3 conditions. Firstly, as mentioned previously, $u$ is required to lie as close as possible to the original image. In order to make sure the resulting problem is convex (which greatly facilitates optimisation), we will express this proximity using the $L^2$-norm. Secondly, 

Putting these requirements together, we define a functional

$$
J[u, K] := \int_{\Omega}(u - g)^2 \, dx + \int_{\Omega}\left \Vert \nabla u \right \Vert ^2 \, dx + \mathcal{H}^1(K) \,.
$$

While this expression may look somewhat daunting on first glance, there's nothing new here: each of the 3 terms in $J$ corresponds to one of the conditions outlined above. 

The *calculus of variations*.

