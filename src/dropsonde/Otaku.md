---
title: Otaku-Hanoi's Mac Rstutio config 
date: 2026-02-03
cover: CRYCHIC.webp
category:
  - Oracle
tag:
  - Manager
star: true
article: true
---



## Otaku

每次启动之时

```bash
export RSTUDIO_WHICH_R="$(mamba run -n Otaku which R)"
/Applications/RStudio.app/Contents/MacOS/RStudio &
```



```
mamba create -n Otaku r-base r-seurat r-signac scanpy -c bioconda
mamba activate Otaku
R
install.packages("BiocManager")

install.packages("remotes")
remotes::install_github("mojaveazure/seurat-disk")

```



```
(Otaku) hanoi@Hanois-MacBook-Air ~ % which R      
/Users/hanoi/miniforge3/envs/Otaku/bin/R
(Otaku) hanoi@Hanois-MacBook-Air ~ % python -c "import sys; print(sys.executable)"
/Users/hanoi/miniforge3/envs/Otaku/bin/python

```

