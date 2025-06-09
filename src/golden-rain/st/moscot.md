---
title: Moscot -Farewell计划
date: 2025-05-18
cover: scenic.jpg
category:
  - ST
tag:
  - scRNAseq
  - ST
  - OT
  - multi-omics
  - nature
star: true
article: false

---





## ①Install

我的CUDA环境（小装一波）

```bash
NVIDIA-SMI 470.199.02   Driver Version: 470.199.02   CUDA Version: 12.1
NVIDIA A100-SXM

```

查看Achitecture和Distribute:

```bash
>uname -m
x86_64
>cat /etc/os-release
PRETTY_NAME="Ubuntu 22.04.3 LTS"
NAME="Ubuntu"
VERSION_ID="22.04"
VERSION="22.04.3 LTS (Jammy Jellyfish)"
VERSION_CODENAME=jammy
ID=ubuntu
ID_LIKE=debian
HOME_URL="https://www.ubuntu.com/"
SUPPORT_URL="https://help.ubuntu.com/"
BUG_REPORT_URL="https://bugs.launchpad.net/ubuntu/"
PRIVACY_POLICY_URL="https://www.ubuntu.com/legal/terms-and-policies/privacy-policy"
UBUNTU_CODENAME=jammy
```

所以我的安装代码：

```bash
mamba create -n moscot-jax   python=3.10   "jaxlib=*=*cuda*" jax   moscot scanpy mudata  -c conda-forge -c defaults
eval "$(mamba shell hook --shell bash)"
mamba activate moscot-jax
mamba install ipykernel
python -m ipykernel install --name=moscot-jax --display-name "Python moscot-jax"
```



附录：安装我的jax开发环境

```bash
amba create -n jax-develop "jaxlib=*=*cuda*" jax -c conda-forge
#这个时候python3.13.3
```





附录