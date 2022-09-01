---
layout: post
title:  "Deriving the Euler-Lagrange equations for Mumford-Shah"
subtitle: "Variational image segmentation - part 2"
date:   2022-08-14 16:43:55 +0200
---

*This is the second entry in my series on variational image segmentation with the Mumford-Shah functional. The previous article can be found [here]("/_posts/2022-08-14-mumford-shah-intro").*

In my previous article, I introduced the challenging task of image segmentation and discussed how the Mumford-Shah model proposes to tackle it. In the end, we concluded that a segmentation could be obtained by solving the variational problem

$$
\begin{equation}
\underset{(u, k) \in \mathcal{A}}{\rm{argmin}} \, J[u, K] \\
\end{equation}
$$

where the functional and its candidate minimisers are given by

$$
\begin{gather*}
J[u, K] := \int_{\Omega}(u - g)^2 \, dx + \int_{\Omega \setminus K}\left \Vert \nabla u \right \Vert ^2 \, dx + \mathcal{H}^1(K) \,.
\end{gather*} \\
\mathcal{A} = \left \lbrace (u, K) \ \vert \ K \subset \Omega \ \text{closed}, \ u \in C^1(\Omega \setminus K) \right \rbrace \,.
$$

We now want to turn this theoretical statement into a form which can be solved numerically on a computer. The usual way this is done for variational problems is to convert them into an equivalent system of PDEs known as the *Euler-Lagrange* equations. This approach originated in analytical mechanics, a formulation of classical physics which uses the *energy* of a system to describe its time-evolution. If $\boldsymbol{q}: [t_1, t_2] \rightarrow \mathbb{R}^3$ represents the position of a particle going from point $\boldsymbol{a}$ to $\boldsymbol{b}$, then the *principle of stationary action* states that $\boldsymbol{q}$ locally minimises the *action*

$$
\mathcal{S}[q] : = \int_{t_1}^{t_2} \mathcal{L}(t, \boldsymbol{q}, \dot{\boldsymbol{q}}) \, dt.
$$

In other words, there exists a neighbourhood of $\boldsymbol{q}$ such that sufficiently small perturbations $\delta \boldsymbol{q} = \epsilon \boldsymbol{\eta}$ which leave the endpoints fixed would cause the value of $\mathcal{S}$ to increase, meaning that the function

$$
\Phi(\epsilon) := \mathcal{S}[\boldsymbol{q} + \epsilon \boldsymbol{\eta}] \,,  
$$

defined on a suitably small interval $(-\epsilon_0, \epsilon_0)$, reaches a minimum for $\epsilon = 0$. This is just an ordinary real function of a single variable, and we know from elementary calculus that a necessary condition for $\Phi$ attaining a minimum is that its derivative must vanish at 0, i.e. $\Phi'(0) = 0$. Writing this out explicitly and using some calculus gymnastics, [it can be shown](https://en.wikipedia.org/wiki/Euler%E2%80%93Lagrange_equation#Statement) that this is equivalent to requiring that $\boldsymbol{q}$ satisfy the equations

$$
\frac{\partial \mathcal{L}}{\partial q_i} = \frac{d}{dt}\frac{\partial \mathcal{L}}{\partial \dot{q_i}} \quad i \in \{1, 2, 3 \}\,,
$$

turning our original variational problem into a system of PDEs.

In attempting to apply this method to (1), the main obstacle we face is the presence of the term $\mathcal{H}^1(K)$, which cannot be absorbed into a Lagrangian. Once again, however, physics comes to our rescue. Specifically, we will address this issue by borrowing ideas which have their origin in the study of *phase seperation*. 

Suppose we are given a container $\Omega$ holding two immiscible fluids, such as oil and water, and we are interested in their final configuration at equilibrium. In order to distinguish between these phases, we arbitrarily fix one of them and introduce a so-called order parameter $u: \Omega  \rightarrow [0, 1]$ indicating the strength of its presence, with 0 meaning complete abscence and 1 total purity. The classical theory of phase transition then states that the fluids will arrange themselves so as to minimise the length of their interface, which is given by the Hausdorff measure $\mathcal{H}^1(S_u)$ of the discontinuity set of $u$. Implicit in this point of view is the assumption that this transition occurs instantly, i.e. $u$ is an indicator function taking values in $\{0, 1 \}$. 

An alternative approach was proposed by the researchers Cahn and Hilliard, who instead chose to model the transition as occuring gradually in a thin layer between the pure bulk volumes. In this case, the equilibrium configuration will minimise the energy

$$
E_\epsilon[u] := \int_\Omega \left( \epsilon \Vert \nabla u \Vert^2 \, + \frac{u^2(1-u)^2}{\epsilon} \right) dx
$$

for some small constant $\epsilon$ controlling the width of the transition layer. 

Heuristically, this functional is composed of two parts pulling in opposite directions, with the second term penalising the failure of $u$ to be binary, and the first term counteracting this by disincentivising steep slopes. As $\epsilon$ tends to 0, the former will come to dominate over the latter, which would suggest that an associated sequence of minimisers $(u_\epsilon)_\epsilon$ would converge to the indicator function $I_A$ of some subset of $\Omega$. This was formally established by the mathematicians Mordica and Mortola, who additionally showed that $I_A$ is a minimiser of the classical formulation and

$$
E_\epsilon (u_\epsilon) \xrightarrow{\epsilon \to 0} \mathcal{H}^1(\partial^* A) \,,
$$

i.e. the Cahn-Hilliard energies converge to the length of the (essential) boundary of $A$. Given that $K = S_u$ in the Mumford-Shah functional, this result gives us a way to approximate the problematic term by a series of more suitable expressions. This was done by two different mathematicians, Ambrosio and Tortorelli, who arrived at the family of the functionals

$$
AT_\epsilon[u, v] := \int_\Omega (u - g)^2 \, dx + \int_\Omega v^2 \Vert \nabla u \Vert^2 \, dx + \int_\Omega \left(\epsilon \Vert \nabla v \Vert^2 + \frac{(1 - v)^2}{4\epsilon} \right) \, dx \,
$$

with the additional function $v$ serving to approximate the discontinuity set here. For a fixed $\epsilon$, the Lagrangian is given by

$$
\mathcal{L}(x, y, u, v, u_x, \dots, v_y) = (u - g)^2 + v^2 \Vert \nabla u \Vert^2 + \epsilon \Vert \nabla v \Vert^2 + \frac{(1 - v)^2}{4\epsilon} \,,
$$

which we can now use to derive a corresponding system of PDEs. Because we're dealing with functions of multiple variables, i.e. $\mathcal{L} = \mathcal{L}(x_1, \dots, x_m, \boldsymbol{q}(x_1, \dots, x_m), (q_1)\_{x_1}, \dots, (q_n)\_{x_m})$, we will need to use the following slight generalisation of Euler-Lagrange:

$$
\frac{\partial \mathcal{L}}{\partial q_i} = \sum_{i = j}^m \frac{\partial}{\partial x_j}\frac{\partial \mathcal{L}}{\partial (q_i)_{x_j}} \quad i \in \{1, 2, 3 \}\,.
$$

We differentiate with respect to $u$ to obtain

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

from which we get

$$
v \Vert \nabla u \Vert^2 - \frac{(1 - v)}{4\epsilon} - \epsilon \Delta v = 0 \,.
$$

Putting these together, we finally arrive at the system

$$
\begin{cases}
(u - g) - \nabla \cdot (v^2 \nabla u) = 0 \\
v \Vert \nabla u \Vert^2 - \frac{1 - v}{4\epsilon} - \epsilon \Delta v = 0 \,.
\end{cases}
$$

In the next article, we will see how to implement a numerical scheme to obtain a solution to these equations.




