+++ 
draft = false
date = 2022-08-14T16:43:54+02:00
title = "Mumford Shah Segmentation: Implementing the Algorithm"
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

which we can solve to obtain a pair of approximations $(u_\epsilon, v_\epsilon)$. We have seen that as $\epsilon \to 0$, the corresponding approximations converge to $(u, I_K)$. All that remains for us, then, is to code this up. We'll use the Python bindings for the [GetFEM](https://getfem.org/) finite element library, as it allows us to specify the equations using its so-called *Generic Weak-Form Language* in a manner which is very close to the original mathematics.

In order to apply the finite element method, we first have to put our PDE into a different form called the *weak formulation*. This is achieved by multiplying both sides by a so-called *test function* and integrating on the domain:

$$
\begin{cases}
	\displaystyle
	\int_\Omega (u - g) \\, w \\, dx - \int_\Omega w \\, \nabla \cdot (v^2 \nabla u) \\, dx = 0 \\\\[2em]
	\displaystyle
	\int_\Omega w \\, v \Vert \nabla u \Vert^2 \\, dx + \frac{1}{4\epsilon}\int_\Omega w v\\, dx - \int_\Omega \epsilon \Delta v \\, w\\, dx = \frac{1}{4\epsilon} \int_\Omega w \\, dx \\,.
\end{cases}
$$

Next, we integrate by parts to reduce by 1 the order of the highest derivative:

$$
\begin{cases}
	\displaystyle
	\int_\Omega (u - g) \\, w \\, dx - \int_\Omega v^2 \\, \nabla w \cdot \nabla u \\, dx = 0 \\\\[2em]
	\displaystyle
	\int_\Omega w \\, v \Vert \nabla u \Vert^2 \\, dx + \int_\Omega \frac{w \\, v}{4\epsilon} \\, dx - \int_\Omega \epsilon \nabla v \cdot \nabla w \\, dx =  \int_\Omega \frac{w}{4\epsilon} \\, dx \\,.
\end{cases}
$$

In GWFL, these equations can be written as

{{< highlight python >}}
md.add_nonlinear_term(mim, "(u-g)*Test_u - pow(v, 2)*Grad_u.Grad_Test_u")
{{< / highlight >}}

and 

{{< highlight python >}}
md.add_nonlinear_term(mim, "Test_v*v*Grad_u.Grad_u + Test_v*v/(4*eps) - eps*Grad_v.Grad_Test_v")
md.add_source_term_brick(mim, "v", "1/(4*eps)")
{{< / highlight >}}

respectively.