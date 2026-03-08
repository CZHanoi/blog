---
title: SCENIC+
date: 2026-03-08
cover: scenic.jpg
category:
  - code
tag:
  - scRNAseq
  - Goni2
star: False
article: False
---





## Installation

①首先将这五个包在github上下载并上传至服务器`~/packgae_python`

②安装代码

```bash
cd /public/home/chenzhh/packgae_python

mamba create -n Mujigae python=3.11.8 -y
mamba activate Mujigae

mamba install -y -c conda-forge -c bioconda python-annoy pybedtools pybigwig pybigtools pysam macs2 bedtools python-igraph leidenalg pytables scatac-fragment-tools
#pip编译困难包↑

grep -Ev 'git\+https://github.com/aertslab/|^(annoy|pybedtools|pyBigWig|pybigtools|pysam|macs2|igraph|leidenalg|tables|scatac-fragment-tools)==' \
  scenicplus/requirements.txt > /tmp/scenicplus.req


python -m pip install -U pip "setuptools==79.0.1" wheel setuptools-scm
python -m pip install -r /tmp/scenicplus.req

python -m pip install --no-deps ./pySCENIC ./LoomXpy ./pycistarget ./pycisTopic ./scenicplus
```

③验证

```bash
python - <<'PY'
import scenicplus, pycisTopic, pycistarget, pyscenic, loomxpy
print("SCENIC+ install OK")
PY
```

