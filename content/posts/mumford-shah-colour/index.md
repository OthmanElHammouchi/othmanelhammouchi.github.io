+++ 
draft = false
date = 2024-04-21T16:51:00+02:00
title = "Encore: segmenting colour images with Mumford-Shah"
description = ""
slug = ""
authors = ["Othman El Hammouchi"]
tags = ["image processing", "Python"]
categories = []
externalLink = ""
series = ["Mumford Shah Image Segmentation"]
+++

I wanted to write a final post in my series on Mumford-Shah segmentation to explain how the [approach]({{< ref "/posts/mumford-shah-implementation.md" >}}) we detailed so far could be extended for colour images. This time, our working example will be this charming picture of [Paul Erdős with child prodigy Terrence Tao](https://www.reddit.com/r/math/comments/2ftoyi/paul_erd%C5%91s_and_terry_tao_in_1985_tt_was_10_when/):

{{< figure src="erdos-tao.jpg" caption="Mathematics transcending age barriers" width="50%" >}}

In this case, both our image and cartoon will have three components (one for each primary colour), 

$$
\begin{cases}
    \boldsymbol{g} = (g_1, g_2, g_3) \\\\[2em]
    \boldsymbol{u} = (u_1, u_2, u_3)
\end{cases}
$$

hence we have to adapt our loss functional to penalise the total deviation in every component:

$$
J[u, K] := \int_{\Omega} \sum_{i = 1}^3 (u_i - g_i)^2 \\, dx + \int_    {\Omega \setminus K}\left \Vert \frac{\partial (u_1, u_2, u_3)}{\partial (x_1, x_2)} \right \Vert_F ^2 \\, dx + \mathcal{H}^1(K) \\,.
$$

where $\Vert \cdot \Vert_F$ denotes the *Frobenius norm*. The linearity of the integration allows us to derive the PDE system and weak form equations in the same way as for the [grayscale case]({{ ref "/posts/mumford-shah-equations" }}), yielding the following UFL expressions.

{{< highlight python >}}

    a = (
        u1 * w1
        + (v**2) * dot(grad(u1), grad(w1))
        + u2 * w2
        + (v**2) * dot(grad(u2), grad(w2))
        + u3 * w3
        + (v**2) * dot(grad(u3), grad(w3))
    ) * dx

    L = (g1 * w1 + g2 * w2 + g3 * w3) * dx

{{< /highlight >}}

{{< highlight python >}}
    a = (
        v * inner(grad(u), grad(u)) * w * dx
        + v * 1 / (4 * eps) * w * dx
        - eps * dot(grad(v), grad(w)) * dx
    )

    L = fem.Constant(domain, 1 / (4 * eps)) * w * dx
{{< /highlight >}}

We can again solve the equations through alternating iteration. Here is the result:

{{< image-pair caption="Segmentation of Tao-Erdos picture" first="colour_cartoon.png" second="colour_edges.png" >}}

Not too shabby if you ask me!