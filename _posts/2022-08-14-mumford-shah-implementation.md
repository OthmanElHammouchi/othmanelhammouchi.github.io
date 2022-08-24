---
layout: post
title:  "Image segmentation with Mumford-Shah: Implementation"
date:   2022-08-14 16:43:55 +0200
---
Hi! 

{% highlight python %}
import numpy as np
import matplotlib.pyplot as plt
import cv2
from fenics import *
import subprocess
from helpers import *
import inspect

img = cv2.imread("image.png", cv2.IMREAD_GRAYSCALE)

Lx = float(img.shape[1])/float(img.shape[0])
Ly = 1.

mesh = RectangleMesh(Point(0,0),Point(Lx,Ly), 500, 500, "crossed")
V = FunctionSpace(mesh, "Lagrange", 1)
trueImage = Image(Lx, Ly, img)
g  = interpolate(trueImage, V)

eps = 1e-6
alpha = 1
beta = 1

cartoon = g

maxiter = 5
iter = 1
while iter <= maxiter:
	edges = solve_edges(cartoon, eps, V, alpha, beta)
	cartoon = solve_cartoon(edges, eps, g, V, beta)
	iter += 1
{% endhighlight %}