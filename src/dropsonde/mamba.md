---
title: Mamba 
date: 2026-03-02
cover: CRYCHIC.webp
category:
  - Oracle
tag:
  - Manager
star: true
article: true
---



## mamba 环境迁移

起因：某个大傻纸把所有的cfff上所有的mamba环境都安装在`/home`下面了；但后面要使用HPC的时候，只能调用`/cpfs01/projects-HDD/cfff-afe2df89e32e_HDD/`目录下的内容，因此导致需要将mamba环境迁移到后面的目录中

操作

```bash
SRC=/home/zy_22111220045/miniconda3/envs/scenicplus
DEST=/cpfs01/projects-HDD/cfff-afe2df89e32e_HDD/zy_22111220045/Env/scenicplus
mkdir -p "$(dirname "$DEST")"
conda create --prefix "$DEST" --clone "$SRC" --copy -y

# find "$DEST" -type d -name "__pycache__" -prune -exec rm -rf {} +
# grep -R "/home/zy_22111220045/miniconda3/envs/scenicplus" -n "$DEST/bin" | head
# grep -RIn --binary-files=without-match "/home/zy_22111220045/miniconda3/envs/scenicplus" "$DEST/bin" | head
```

其中

`conda create`：创建一个新环境。 

`--prefix "$DEST"`（等价 `-p "$DEST"`）：把新环境**创建在这个绝对路径**。

`--clone "$SRC"`：**从现有本地环境复制一份**到新环境（尽量做到“同一个环境的拷贝”）。

`--copy`：安装/落盘时**用复制**，而不是硬链接/软链接（跨文件系统时更稳，尤其你从 `/home` 到 `/cpfs01`）。

`-y`：自动回答 yes



使用的时候便可以:

```
conda activate /cpfs01/projects-HDD/cfff-afe2df89e32e_HDD/zy_22111220045/Env/scenicplus
```

