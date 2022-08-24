---
layout: post
title:  "Image segmentation with Mumford-Shah: Theory"
date:   2022-08-14 16:43:55 +0200
---

In my previous article, I introduced the problem of image segmentation and explained how we could obtain a good model for solving it by minimising the Mumford-Shah functional

$$
\begin{equation}
J[u, K] := \int_{\Omega}(u - g)^2 \, dx + \int_{\Omega}\left \Vert \nabla u \right \Vert ^2 \, dx + \mathcal{H}^1(K) \,.
\end{equation}
$$

While this provides us with the necessary theoretical foundation, we still have a long way to go before we can turn this analytic expression into a formulation which can actually be solved on a computer. The usual way to solve variational problems is to convert them to a system of PDEs known as the *Euler-Lagrange* equations. This approach has its original in analytical mechanics, an alternative formulation of Newton's laws which uses the *energy* of a mechanical system to describe its time-evolution. If $\bm{q}: [t_1, t_2] \rightarrow \mathbb{R}^3$ represents the position of a particle going from point $\bm{a}$ to $\bm{b}$, then the *principle of stationary action* states that $\bm{q}$ minimises the *action*

$$
\int_{t_1}^{t_2} \mathcal{L}(t, \bm{q}, \dot{\bm{q}}) \, dt
$$

among all continuously differentiable paths $C^1([t_1, t_2], \mathbb{R}^3)$. It can be shown that this is equivalent to requiring that $\bm{q}$ satisfy the equations

$$
\frac{\partial \mathcal{L}}{\partial q_i} = \frac{d}{dt}\frac{\partial \mathcal{L}}{\partial \dot{q_i}} \quad i \in \{1, 2, 3 \}\,.
$$

The obstacle preventing us from to applying this to (1) is the presence of the Hausdorff measure term $\mathcal{H}^1(K)$. In order to overcome this, we introduce a new function $v: \Omega \rightarrow [0, 1]$ which approximates the indicator function of K.



$$

$$
