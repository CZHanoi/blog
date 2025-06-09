---
title: CellOracle
date: 2025-05-18
cover: scenic.jpg
category:
  - Multi-Omics & ATAC
tag:
  - scRNAseq
  - GRNs
  - multi-omics
  - nature
star: true
article: true

---



## ①Install

没啥特别的，除了安装`velocyto`时需要numpy和Cython，所以不能像官网那样直接pip。

```
mamba create -n celloracle python=3.10
eval "$(mamba shell hook --shell bash)"
mamba activate celloracle
pip install numpy==1.26.4 cython==3.1.1
pip install celloracle
mamba install ipykernel
python -m ipykernel install --name=celloracle --display-name "Python celloracle"

```



