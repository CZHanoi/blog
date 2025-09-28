







```
mamba create -y -n milton hdf5 r=4.3.1 r-hdf5r r-hdf5r.extra r-seurat
# mamba create -y -n milton hdf5 r-hdf5r r-hdf5r.extra r-seurat
mamba install r-devtools
mamba install python=3.9.19 anndata matplotlib numpy pandas pytorch=2.0.0 scanpy scikit-learn=1.0.2 scipy seaborn notebook
R
library(devtools)
install_local("/cpfs01/projects-HDD/cfff-afe2df89e32e_HDD/zy_22111220045/Package/cytotrace2-main/cytotrace2_r")
install.packages('IRkernel')
IRkernel::installspec(name = "milton-r-443", displayname = "Milton R 4.4.3")

python -m ipykernel install --user --name=Milton --display-name "Python Milton"
```

