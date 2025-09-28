---
title: scMultiSim
date: 2025-06-04
category:
  - ST
tag:
  - scRNAseq
  - ST
  - multi-omics

star: false
article: false


---







```
mamba env create -f cnmf.yml
eval "$(mamba shell hook --shell bash)"
mamba activate cnmf
python -m ipykernel install --name=cnmf --display-name "Python cnmf"
mamba install r=4.4.3 r-hdf5r r-hdf5r.extra r-devtools r-seurat 
R
devtools::install_local("/cpfs01/projects-HDD/cfff-afe2df89e32e_HDD/zy_22111220045/Package/seurat-disk")
install.packages('IRkernel')
IRkernel::installspec(name = "NMF-r-443", displayname = "NMF R 4.4.3")
```

