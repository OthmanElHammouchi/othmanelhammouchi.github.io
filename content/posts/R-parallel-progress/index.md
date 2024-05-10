+++ 
draft = false
date = 2024-04-15T20:09:08+02:00
title = "Fancy thread safe progress bar in R for compiled code"
description = ""
slug = ""
authors = []
tags = ["R"]
categories = []
externalLink = ""
series = []
+++

I've been working a lot recently on organising the code I wrote for my master's thesis into an R package to hopefully get it published on CRAN. Since the calculations involved are rather intensive, I chose to implement them in C++ and Fortran, and used the OpenMP API to parallelise them. After many grueling hours of debugging segfaults, the package finally seemed to be coming together, but there was still one aspect I couldn't quite get right: tracking progress.

You could argue that this is somewhat of a superfluous functionality, but I disagree: when you have a blocking function that does a long computation, not providing some indicator of how far along it has come is just a bad user experience. Personnaly, I also like for progress bars to be aesthetically appealing, although I will admit this is primarily driven by vanity.

When it comes to producing beautiful output in the R world, it's undeniable that the `tidyverse` suite (primarily maintained by Posit, of RStudio fame) rules the roost. Say what you will about the opinionated nature of many its packages, which can often feel a bit too frameworky to me as well, it's hard to compete with `ggplot` or `devtools` when it comes to eye candy. The same goes for their [`cli` package](https://cli.r-lib.org/index.html), which provides tools for building some truly stunning outputs in the terminal.

The good news is that `cli` does provide a C API, which could be made available in Fortran through some straightforward wrappers. Unfortunately for my use-case, however, the package is not [thread safe](https://github.com/r-lib/cli/issues/475), and there does not appear to be an easy way to make it so. As far as I can tell, the only package which provides a parallel-friendly progress bar in R is [`RcppProgress`](https://cran.r-project.org/web/packages/RcppProgress/index.html), but this only provides ASCII-based progress bars out of the box.

Unwilling to abandon my aesthetic aspirations, I tried to find another way of reproducing `cli`'s output. Luckily, `RcppProgress` allows users to easily define their own progress bars following the tutorial [here](https://gallery.rcpp.org/articles/custom-bars-rcppprogress/). After looking at the `cli` progress bar's underlying C code [here](https://github.com/r-lib/cli/blob/main/src/ansi.c) and checking out [this great ANSI reference on GitHub](https://gist.github.com/fnky/458719343aabd01cfb17a3a4f7296797), this is what I came up with:

{{< highlight cpp "linenos=table" >}}
#include <R_ext/Print.h>
#include <RcppArmadillo.h>

#include <progress_bar.hpp>

class CliProgressBar : public ProgressBar {
   public:
    CliProgressBar() { reset(); }

    ~CliProgressBar() {}

   public:
    void display() { Rcpp::Rcout << "\033[37mRunning simulations "; }

    void update(float progress) {
        _update_ticks_display(progress);
        if (_ticks_displayed >= _max_ticks) _finalize_display();
    }

    void end_display() {
        update(1);
        reset();
    }

    void reset() {
        Rcpp::Environment cli = Rcpp::Environment::namespace_env("cli");
        Rcpp::Function console_width = cli["console_width"];

        // From fiddling around with it, it seems that dividing the console
        // width by 2 produces the best display.
        _max_ticks = std::floor(Rcpp::as<int>(console_width()) / 2);
        _ticks_displayed = 0;
        _finalized = false;
    }

   protected:
    void _update_ticks_display(float progress) {
        int nb_ticks = _compute_nb_ticks(progress);
        int delta = nb_ticks - _ticks_displayed;
        if (delta > 0) {
            Rcpp::Rcout << "\r" << std::flush;
            _ticks_displayed = nb_ticks;
            _display_ticks(progress);
        }
    }

    void _finalize_display() {
        if (_finalized) return;

        Rcpp::Rcout << std::endl;
        _finalized = true;
    }

    int _compute_nb_ticks(float progress) { return int(progress * _max_ticks); }

    void _display_ticks(double progress) {
        Rcpp::Rcout << "\033[37mRunning simulations ";
        for (int i = 0; i < _ticks_displayed; ++i) {
            Rcpp::Rcout << "\033[32m\u25A0" << std::flush;
        }
        for (int i = 0; i < (_max_ticks - _ticks_displayed); i++) {
            Rcpp::Rcout << " " << std::flush;
        }
        Rcpp::Rcout << "\033[37m | " << int(progress * 100) << "%";
    }

   private:
    int _max_ticks;        // the total number of ticks to print
    int _ticks_displayed;  // the nb of ticks already displayed
    bool _finalized;
};
{{< / highlight >}}

And here is what it looks like:

{{% figure src="demo.svg" %}}

Not too shabby if you ask me!