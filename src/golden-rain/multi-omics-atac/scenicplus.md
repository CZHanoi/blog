---
title: SCENIC+ 的网络研讨会笔记
date: 2025-05-18
cover: scenic.jpg
category:
  - Multi-Omics & ATAC
tag:
  - scRNAseq
  - GRNs
  - multi-omics
  - nature-methods
star: true
article: true
---





链接指路:[SCENIC+ Stein Aerts lab seminar.](https://www.youtube.com/watch?v=QW63LLd1XC8&t=2079s)

讲解者：Seppe De Winter，文章的二作，来自巨无霸的[Stein Aerts Lab - VIB - KULeuven](https://aertslab.org/)组

## 安装 Install

这部分真的不想多说，因为众所周知的原因，安装得需要借助强大的“外”力；以及因为“pybigwig==0.3.23”的原因，Windows系统我试了很多次都没有成功。

```
git clone https://github.com/aertslab/scenicplus
#直播的时候这一步能秒完成，真的馋哭了
#git clone git@github.com:aertslab/scenicplus.git
mamba create --name scenicplus python=3.11.8
#推荐3.11版本
mamba activate scenicplus
cd scenicplus/
git checkout development
pip install .
```

Notes:如果出现下面的报错，原因是git连不上（典）

```shell
fatal: unable to access 'https://github.com/aertslab/LoomXpy/': Recv failure: Connection was reset
  error: subprocess-exited-with-error

  × git clone --filter=blob:none --quiet https://github.com/aertslab/LoomXpy 'C:\Users\Hanoi\AppData\Local\Temp\pip-install-vyuu71m4\loomxpy_152eb1f7ca014b02893fa317b79a7d6c' did not run successfully.
  │ exit code: 128
  ╰─> See above for output.

  note: This error originates from a subprocess, and is likely not a problem with pip.
error: subprocess-exited-with-error

× git clone --filter=blob:none --quiet https://github.com/aertslab/LoomXpy 'C:\Users\Hanoi\AppData\Local\Temp\pip-install-vyuu71m4\loomxpy_152eb1f7ca014b02893fa317b79a7d6c' did not run successfully.
│ exit code: 128
╰─> See above for output.

note: This error originates from a subprocess, and is likely not a problem with pip.
```

这个时候我的解决办法是换成美国的VPN(暂时)

有一个十分费力的安装方法，后面得单独开一个页面来讲述了:astonished:

### 验证安装成功:

终端中直接运行

```shell
(base) [chenzhh@nodecw4 ~]$ conda activate scenicplus
(scenicplus) [chenzhh@nodecw4 ~]$ scenicplus

   ____   ____ _____ _   _ ___ ____
  / ___| / ___| ____| \ | |_ _/ ___| _
  \___ \| |   |  _| |  \| || | |   _|.|_
   ___) | |___| |___| |\  || | |__|_..._|
  |____/ \____|_____|_| \_|___\____||_|


scenicplus verions: 1.0a2
usage: scenicplus [-h] {init_snakemake,prepare_data,grn_inference} ...

Single-Cell Enhancer-driven gene regulatory Network Inference and Clustering

positional arguments:
  {init_snakemake,prepare_data,grn_inference}

options:
  -h, --help            show this help message and exit
(scenicplus) [chenzhh@nodecw4 ~]$ pycistarget


██████╗ ██╗   ██╗ ██████╗██╗███████╗████████╗ █████╗ ██████╗  ██████╗ ███████╗████████╗
██╔══██╗╚██╗ ██╔╝██╔════╝██║██╔════╝╚══██╔══╝██╔══██╗██╔══██╗██╔════╝ ██╔════╝╚══██╔══╝
██████╔╝ ╚████╔╝ ██║     ██║███████╗   ██║   ███████║██████╔╝██║  ███╗█████╗     ██║
██╔═══╝   ╚██╔╝  ██║     ██║╚════██║   ██║   ██╔══██║██╔══██╗██║   ██║██╔══╝     ██║
██║        ██║   ╚██████╗██║███████║   ██║   ██║  ██║██║  ██║╚██████╔╝███████╗   ██║
╚═╝        ╚═╝    ╚═════╝╚═╝╚══════╝   ╚═╝   ╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝ ╚══════╝   ╚═╝


pycistarget version: 1.1
usage: pycistarget [-h] {cistarget,dem} ...

Motif enrichment analysis.

positional arguments:
  {cistarget,dem}

options:
  -h, --help       show this help message and exit
(scenicplus) [chenzhh@nodecw4 ~]$ pycistopic
usage: pycistopic [-h] {qc,topic_modeling,tss} ...
pycistopic: error: the following arguments are required: command
```

**Notes：**不要问为什么pycistopic的输出是个error,因为De Winter讲的时候就是这样样子（）

<div style="text-align: center;" id="fig0">
    <img src="./images/scenic/install.jpg" style="width:80%">
    <div>
        <span style="color:gray">Figure 0: Installed</span>
        <br><br>
    </div>
</div>


## 工作流 Workflow Overlook

<div style="text-align: center;" id="fig1">
    <img src="./images/scenic/workflow.png" style="width:80%">
    <div>
        <span style="color:gray">Figure 1: Workflow</span>
        <br><br>
    </div>
</div>


主要目的从ATAC数据+Expression数据（multiomics data）推断**enhancer driven** GRNs。

主要流程分成了下面三个独立的仓库

①`aertslab/pycisTopic`

处理ATAC数据，获得consensus peak。

②`aertslab/pycisTarget`

推断潜在的TF和对应的Region，富集。

③`aertslab/scenicplus`

结合Expression数据获得GRNs。

**Notes：**

该方法只推荐用于模式生物和人，一方面是作者只提供了大鼠、小鼠、人和果蝇的blacklist，另一方面可能就是不同生物的GRNs之间真的有很大差异；



## pycisTopic



<div style="text-align: center;" id="fig2a">
    <img src="./images/scenic/pycisTopic1.png" style="width:80%">
    <div>
        <span style="color:gray">Figure 2a: pycisTopic purpose</span>
        <br><br>
    </div>
</div>


输入文件解释：

①每个样本的Fragmen.tsv.gz文件和index(.tbl)

②细胞注释（Github上有Issue写了无注释的方法，但极不推荐）

生成文件解释：

①bed文件 :存储Consensus peak set

②Imputed accessibility matrix*

Notes：插值的原因是scATAC-seq矩阵高度稀疏（对比scRNA-seq来说）

③bed文件 :存储Co-accessible regions（用于pycisTarget后续分析）

- Topics: 描述染色质的开放模式
- DARs (Differencially accessible regions): 不同细胞类型或条件间有显著差异的区域。



<div style="text-align: center;" id="fig2b">
    <img src="./images/scenic/pycisTopic2.png" style="width:80%">
    <div>
        <span style="color:gray">Figure 2b: pycisTopic workflow</span>
        <br><br>
    </div>
</div>


### ①推断共识峰（获取新的特征）Infer Consensus Peak

<1>Pseudo-Bulk Peak Sets的建立: **Aggregate** all of the reads coming from **Barcodes of the same cell type** into a **single fragment file**.

<2>Call Peaks on each individual fragment file per cell type.

```python
narrow_peak_dict = peak_calling(
    macs_path = macs_path,
    bed_paths = bed_paths,
    outdir = os.path.join(os.path.join(out_dir, "consensus_peak_calling/MACS")),
    genome_size = 'hs',
    n_cpu = 10,
    input_format = 'BEDPE',
    shift = 73,
    ext_size = 146,
    keep_dup = 'all',
    q_value = 0.05,
    _temp_dir = "/tmp"
)
```

<3>共识整合Consensus peak: Merge all these peaks per cell type into a single Peak Set.

```python
from pycisTopic.iterative_peak_calling import get_consensus_peaks
peak_half_width=250
#peak scale will be set as 500 base
path_to_blacklist="/public/home/chenzhh/packgae_python/pycisTopic/blacklist/hg38-blacklist.v2.bed"
# Get consensus peaks
consensus_peaks = get_consensus_peaks(
    narrow_peaks_dict = narrow_peak_dict,
    peak_half_width = peak_half_width,
    chromsizes = chromsizes,
    path_to_blacklist = path_to_blacklist)
#↓导出为bed文件
consensus_peaks.to_bed(
    path = os.path.join(out_dir, "consensus_peak_calling/consensus_regions.bed"),
    keep =True,
    compression = 'infer',
    chain = False)
```

 

<div style="text-align: center;" id="fig2b">
    <img src="./images/scenic/igv_pycistopic.jpg" style="width:80%">
    <div>
        <span style="color:gray">Figure 2c: IGV views of Peaks</span>
        <br><br>
    </div>
</div>



**Notes:**

使用IGV看得到的结果，其中每一行都是一种细胞类型；

黑色的框则是最后计算得到的共识峰（Consensus peak）。后面的步骤则是**以这些Consensus peak作为features，每个Cell Barcodes作为index重新生成matrix**。

### ②QC + 生成新的计数矩阵

filter high quality Cell barcodes（个人觉得，如果之前做过了这步可以省略，而且De Winter讲到这里的时候翻车了hhhh）→generate account matrix

<1>QC

原理和其他工具都一样，简单介绍一下De Winter分享的如何看QC图（本人反正一直都是懵懵懂懂的）

<div style="text-align: center;" id="fig2b">
    <img src="./images/scenic/qc.webp" style="width:100%">
    <div>
        <span style="color:gray">Figure 2d: QC</span>
        <br><br>
    </div>
</div>



图Left:(Number of Fragment——Barcode Rank): 希望观察到的是一个sharp knee

图Middle(Fragment Ratio——Fragment Size): 长这个样子，两个峰分别代表mononucleosomal (单核小体)和dinucleosomal(双核小体)

图Right(TSS的Normalized Eenrichiment): 很漂亮的TSS enrichment

<2>生成cistopic_obj

```python
pycistopic_qc_output_dir = "outs/qc"

from pycisTopic.cistopic_class import create_cistopic_object_from_fragments
import polars as pl

cistopic_obj_list = []
for sample_id in fragments_dict:
    sample_metrics = pl.read_parquet(
        os.path.join(pycistopic_qc_output_dir, f'{sample_id}.fragments_stats_per_cb.parquet')
    ).to_pandas().set_index("CB").loc[ sample_id_to_barcodes_passing_filters[sample_id] ]
    cistopic_obj = create_cistopic_object_from_fragments(
        path_to_fragments = fragments_dict[sample_id],
        path_to_regions = path_to_regions,
        path_to_blacklist = path_to_blacklist,
        metrics = sample_metrics,
        valid_bc = sample_id_to_barcodes_passing_filters[sample_id],
        n_cpu = 1,
        project = sample_id,
        split_pattern = '-'
    )
    cistopic_obj_list.append(cistopic_obj)
```

如果不使用他们的QC，则将`metrics`和`valid_bc`设定为`None`，如下

```python
path_to_regions = os.path.join(out_dir, "consensus_peak_calling/consensus_regions.bed")
path_to_blacklist = "/public/home/chenzhh/packgae_python/pycisTopic/blacklist/hg38-blacklist.v2.bed"

from pycisTopic.cistopic_class import create_cistopic_object_from_fragments

cistopic_obj_list = []
for sample_id in fragments_dict:
    cistopic_obj = create_cistopic_object_from_fragments(
        path_to_fragments = fragments_dict[sample_id],
        path_to_regions   = path_to_regions,
        path_to_blacklist = path_to_blacklist,
        metrics           = None,
        valid_bc          = None,
        n_cpu             = 10,
        project           = sample_id,
        split_pattern     = '-'
    )
    cistopic_obj_list.append(cistopic_obj)

```



### ③Topic modeling

<1>Impute accessibility

<2>获得 Co-accessible Topics: Sets of Co-accessible Regions



##  pycisTarget



<div style="text-align: center;" id="fig2b">
    <img src="./images/scenic/pycisTarget1.jpg" style="width:80%">
    <div>
        <span style="color:gray">Figure 3a: pycisTarget purpose</span>
        <br><br>
    </div>
</div>

作用：在co-accessible region中找到enrich motifs



输入文件解释：

<1>Set of co-accessible region，可以是Topics或者DARs

→**※CisTarget Database** 

<2>Motif Collection，见网址[Index of /cistarget/motif_collections/v10nr_clust_public](https://resources.aertslab.org/cistarget/motif_collections/v10nr_clust_public/)

输出文件：

注释成TF的富集的motifs集合



<div style="text-align: center;" id="fig3b">
    <img src="./images/scenic/pycisTarget2.jpg" style="width:80%">
    <div>
        <span style="color:gray">Figure 3b: create_cisTarget_databases WorkFlow</span>
        <br><br>
    </div>
</div>



Notes: 尽管他们预先计算好了人鼠果蝇的motifs-to-TF Annotations (Target Database),但这些只是在General regions，所以推荐自己根据Consensus Peaks自己创建Database。



### ①Create Cistarget Database

<1>访问仓库[`aertslab/create_cisTarget_databases`](https://github.com/aertslab/create_cisTarget_databases)

给DNA序列进行motifs打分

<2>下载工具[`Cluster-Buster`](https://resources.aertslab.org/cistarget/programs/cbust)

使用隐马尔可夫链方法生成分数

```
wget https://resources.aertslab.org/cistarget/programs/cbust
chmod a+x cbust
```

<3>下载[Motif Collection](https://resources.aertslab.org/cistarget/motif_collections/v10nr_clust_public/)

**<4>**将Consensus Peaks 转为 fasta文件（使用bedtools)

选作: add 1kb of background padding，作为cluster-buster的Background sequence。

<5>运行



<div style="text-align: center;" id="fig3c">
    <img src="./images/scenic/pycisTarget3.jpg" style="width:80%">
    <div>
        <span style="color:gray">Figure 3c: pycisTarget WorkFlow</span>
        <br><br>
    </div>
</div>



##  SCENICPlus

讲者: Darina Abaffyová, 同组的PhD



<div style="text-align: center;" id="fig4a">
    <img src="./images/scenic/scenic1.jpg" style="width:80%">
    <div>
        <span style="color:gray">Figure 4a: scenic+ WorkFlow</span>
        <br><br>
    </div>
</div>



 





```
wget -O data/fragments.tsv.gz https://cf.10xgenomics.com/samples/cell-arc/1.0.0/human_brain_3k/human_brain_3k_atac_fragments.tsv.gz
wget -O data/fragments.tsv.gz.tbi https://cf.10xgenomics.com/samples/cell-arc/1.0.0/human_brain_3k/human_brain_3k_atac_fragments.tsv.gz.tbi
wget -O data/cell_data.tsv https://raw.githubusercontent.com/aertslab/pycisTopic/polars/data/cell_data_human_cerebellum.tsv
```

