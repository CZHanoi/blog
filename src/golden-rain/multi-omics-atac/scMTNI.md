---
title: scMultiSim
date: 2025-06-04
category:
  - Multi-Omics & ATAC
tag:
  - scRNAseq
  - simulation
  - multi-omics
  - GRNs
  - nature-ncomms
star: true
article: false

---











## ①Install

### <1>创建环境及R包`LIGER`安装

```

mamba create -n scMTNI fftw=3.3.10 hdf5
eval "$(mamba shell hook --shell bash)"
mamba activate scMTNI
mamba install r=4.3.1 r-hdf5r r-hdf5r.extra 
mamba install bioconda::bioconductor-delayedarray
mamba install bioconda::bioconductor-hdf5array
mamba install r-devtools r-seurat r-signac r-rcppplanc
R

```

按照流程不会出错

```
--------------------------------------------------------------
         FFTW transforms passed basic tests!
--------------------------------------------------------------
```

记得以后跑的时候

```R
ligerObj <- runTSNE(ligerObj, method = "fftRtsne", fitsnePath = "/cpfs01/projects-HDD/cfff-afe2df89e32e_HDD/zy_22111220045/Tool/FItSNE_local/FIt-SNE")
```

安装R包

```
mamba create -n Otaku r=4.3.1 r-seurat bioconda::r-leidenbase zlib xz bioconductor-genomeinfodb     bioconductor-genomicranges     bioconductor-iranges     bioconductor-rsamtools     bioconductor-s4vectors     bioconductor-biocgenerics 


install.packages("BiocManager")
chooseBioCmirror()
BiocManager::install("GenomeInfoDbData")
# BiocManager::install(c('GenomeInfoDb', 'GenomicRanges', 'IRanges', 'Rsamtools', 'S4Vectors', 'BiocGenerics'))
install.packages("Signac")
```

