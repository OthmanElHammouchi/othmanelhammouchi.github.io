---
title: "{{ replace .Name "-" " " | title }}"
date: {{ .Date }}
draft: true
---

{{ if or .Params.math .Site.Params.math }}
{{ partial "math.html" . }}
{{ end }}

