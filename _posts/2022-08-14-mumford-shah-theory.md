---
layout: post
title:  "Deriving the Euler-Lagrange equations for Mumford-Shah"
subtitle: "Variational image segmentation - part 2"
date:   2022-08-14 16:43:55 +0200
---

*This is the second entry in my series on variational image segmentation with the Mumford-Shah functional. The previous article can be found [here]("/_posts/2022-08-14-mumford-shah-intro").*

In my previous article, I introduced the problem of image segmentation and explained how we could obtain a good model for solving it by minimising the Mumford-Shah functional

$$
\begin{equation}
J[u, K] := \int_{\Omega}(u - g)^2 \, dx + \int_{\Omega}\left \Vert \nabla u \right \Vert ^2 \, dx + \mathcal{H}^1(K) \,.
\end{equation}
$$

While this provides us with the necessary theoretical foundation, we still have a long way to go before we can turn this analytic expression into a formulation which can actually be solved on a computer. The usual way to solve variational problems is to convert them to a system of PDEs known as the *Euler-Lagrange* equations. This approach has its original in analytical mechanics, an alternative formulation of Newton's laws which uses the *energy* of a mechanical system to describe its time-evolution. If $\boldsymbol{q}: [t_1, t_2] \rightarrow \mathbb{R}^3$ represents the position of a particle going from point $\boldsymbol{a}$ to $\boldsymbol{b}$, then the *principle of stationary action* states that $\boldsymbol{q}$ minimises the *action*

$$
\int_{t_1}^{t_2} \mathcal{L}(t, \boldsymbol{q}, \dot{\boldsymbol{q}}) \, dt
$$

among all continuously differentiable paths $C^1([t_1, t_2], \mathbb{R}^3)$. It can be shown that this is equivalent to requiring that $\boldsymbol{q}$ satisfy the equations

$$
\frac{\partial \mathcal{L}}{\partial q_i} = \frac{d}{dt}\frac{\partial \mathcal{L}}{\partial \dot{q_i}} \quad i \in \{1, 2, 3 \}\,.
$$

The obstacle preventing us from to applying this to (1) is the presence of the Hausdorff measure term $\mathcal{H}^1(K)$. In order to overcome this, we introduce a new function $v: \Omega \rightarrow [0, 1]$ which approximates the indicator function of K.

$$
AT_\epsilon(u, v) := \int_\Omega (u - g)^2 \, dx + \int_\Omega v^2 \Vert \nabla u \Vert^2 \, dx + \int_\Omega \left(\epsilon \vert v \vert^2 + \frac{(1 - v)^2}{4\epsilon} \right) \, dx \,
$$

with Lagrangian given by

$$
\mathcal{L}(x, y, u, v, u_x, \dots, v_y) = (u - g)^2 + v^2 \Vert \nabla u \Vert^2 + \epsilon \vert v \vert^2 + \frac{(1 - v)^2}{4\epsilon} \,.
$$

In order to arrive at an equivalent system of PDEs, it only remains for us now to apply Euler-Lagrange to this functional for an arbitrary fixed $\epsilon$. As we're dealing with functions of multiple variables, i.e. $\mathcal{L} = \mathcal{L}(x_1, \dots, x_m, \boldsymbol{q}(x_1, \dots, x_m), (q_1)\_{x_1}, \dots, (q_n)\_{x_m})$, we will need to use the following slight generalisation:

$$
\frac{\partial \mathcal{L}}{\partial q_i} = \sum_{i = j}^m \frac{\partial}{\partial x_j}\frac{\partial \mathcal{L}}{\partial (q_i)_{x_j}} \quad i \in \{1, 2, 3 \}\,.
$$

We can differentiate with respect to $u$ to obtain

$$
\begin{cases} 
	\displaystyle
	\frac{\partial \mathcal{L}}{\partial u} = 2(u - g) \\
	\displaystyle
	\frac{\partial \mathcal{L}}{\partial u_x} = 2v^2u_x \\
	\displaystyle
	\frac{\partial \mathcal{L}}{\partial u_y} = 2v^2u_y \\ 
	\frac{\partial}{\partial x}\frac{\partial \mathcal{L}}{\partial u_x} + \frac{\partial }{\partial x}\frac{\partial \mathcal{L}}{\partial u_y} = \left( \frac{\partial}{\partial x}, \frac{\partial}{\partial x}\right) \cdot \left( 2v^2u_x, 2v^2u_y \right) \,,
\end{cases}
$$

leading to the equation 

$$
(u - g) - \nabla \cdot (v^2 \nabla u) = 0 \,.
$$

Similarly, differentiating with respect to $v$ yields

$$
\begin{cases} 
	\displaystyle
	\frac{\partial \mathcal{L}}{\partial v} = 2v \Vert \nabla u \Vert^2 \\
	\displaystyle
	\frac{d}{dx}\frac{\partial \mathcal{L}}{\partial v_x} = \frac{d}{dx}(2\epsilon v_x) = 2\epsilon v_{xx} \\
	\displaystyle
	\frac{d}{dy}\frac{\partial \mathcal{L}}{\partial v_y} = \frac{d}{dy}(2\epsilon v_y) = 2\epsilon v_{yy} \,,
\end{cases}
$$

from which we obtain

$$
v \Vert \nabla u \Vert^2 - \frac{1 - v}{4\epsilon} - \epsilon \Delta v = 0 \,.
$$




