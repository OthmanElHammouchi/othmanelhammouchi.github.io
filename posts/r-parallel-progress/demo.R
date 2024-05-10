library(trngl)

res <- mackResidSim(UKMotor, "origin",
  cond = FALSE,
  resid_type = "studentised",
  n_boot = 1e3,
  n_sim = 1e3,
  progress = TRUE
)
