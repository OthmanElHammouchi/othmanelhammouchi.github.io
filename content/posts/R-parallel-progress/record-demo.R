cast <- asciicast::record("content/posts/R-parallel-progress/demo.R",
  empty_wait = 0.5,
  speed = 0.5,
  echo = FALSE,
  rows = 5
)

asciicast::write_svg(cast, "content/posts/R-parallel-progress/demo.svg", theme = "monokai")
