+++ 
draft = false
date = 2022-08-14T16:43:54+02:00
title = "Implementing the Algorithm"
description = ""
slug = ""
authors = []
tags = ["image processing", "Python"]
categories = []
externalLink = ""
series = ["Mumford-Shah Image Segmentation"]
+++

*This is the final article in my series on variational image segmentation with the Mumford-Shah functional. The previous parts can be found [here]({{< ref "mumford-shah-intro" >}}) and [here]({{< ref "mumford-shah-equations" >}}).*

In the previous article, we discussed the challenges with the numerical implementation of the Mumford-Shah functional and defined a series of approximations which allow us to overcome them. This allowed us in turn to derive the Euler-Lagrange PDEs

$$
\begin{cases}
	\displaystyle
	(u - g) - \nabla \cdot (v^2 \nabla u) = 0 \\\\[1em]
	\displaystyle
	v \Vert \nabla u \Vert^2 - \frac{1 - v}{4\epsilon} - \epsilon \Delta v = 0
\end{cases}
$$

which we can solve to obtain a pair of approximations $(u_\epsilon, v_\epsilon)$. We have seen that as $\epsilon \to 0$, the corresponding approximations converge to $(u, I_K)$. All that remains for us, then, is to code this up. We'll use the [FEniCS](https://fenicsproject.org/) finite element library for Python, which allows us to write code very close to the original mathematics.

In order to apply the finite element method, we first have to put our PDE into a different form called the *weak formulation*. This is achieved by multiplying both sides by a so-called *test function* and integrating on the domain:

$$
\begin{cases}
	\displaystyle
	\int_\Omega (u - g) \, w \, dx - \int_\Omega w \, \nabla \cdot (v^2 \nabla u) \, dx = 0 \\\\[2em]
	\displaystyle
	\int_\Omega w \, v \Vert \nabla u \Vert^2 \, dx + \frac{1}{4\epsilon}\int_\Omega w v\,  \, dx - \int_\Omega \epsilon \Delta v \, w\, dx = \frac{1}{4\epsilon} \int_\Omega w \, dx \,.
\end{cases}
$$

Next, we integrate by parts to reduce by 1 the order of the highest derivative:

$$
\begin{cases}
	\displaystyle
	\int_\Omega (u - g) \, w \, dx - \int_\Omega v^2 \, \nabla w \cdot \nabla u \, dx = 0 \\\\[2em]
	\displaystyle
	\int_\Omega w \, v \Vert \nabla u \Vert^2 \, dx + \int_\Omega \frac{w \, v}{4\epsilon} \, dx - \int_\Omega \epsilon \nabla v \cdot \nabla w \, dx =  \int_\Omega \frac{w}{4\epsilon} \, dx \,.
\end{cases}
$$

In FEniCS, these equations can be written as


{{< highlight python >}}
L = g*w*dx
a = u*w*dx + beta*(v**2)*dot(grad(u), grad(w))*dx
{{< / highlight >}}

and 

{{< highlight python >}}
a = dot(grad(u), grad(u))*beta*v*w*dx + eps*alpha*dot(grad(v), grad(w))*dx + alpha/(4*eps)*v*w*dx
L = Constant(alpha/(4*eps))*w*dx
{{< / highlight >}}

respectively.