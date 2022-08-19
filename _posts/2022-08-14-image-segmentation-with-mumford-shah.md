---
layout: post
title:  "Image segmentation with the Mumford-Shah functional"
date:   2022-08-14 16:43:55 +0200
---
# Image segmentation with the Mumford-Shah functional
## An introduction to variational image analysis

We live in a time when digital imaging has become better, cheaper and more available than ever before. 

using so-called variational methods from the mathematical field of functional analysis. 

A functional is simply a special name given to a function whose domain itself consists of functions. If we consider, for example, the space $C^1([0, 1])$ of continuously differentiable functions on the unit interval of the real line, the assignment

$$
f \mapsto \int_0^1 f(x) \, dx
$$ 

defines a functional from this space to the real numbers $\mathbb{R}$. Similarly, the differential operator $\frac{\partial}{\partial}$ which maps functions to their derivative also defines a functional. This more abstract view of the basic notions of calculus turns out to be valuable in many applications, especially those involving partial differential equations.

The *calculus of variations* is concerned with the minimisation of certain given functionals.


In a seminal 1989 paper, Mumford and Shah proposed to do this using the functional which came to bear their names:

$$
MS[u, K] := \int_{\Omega}(u - g)^2 \, dx + \int_{\Omega}\left \Vert \nabla u \right \Vert ^2 \, dx + \mathcal{H}^1(K) \,.
$$

