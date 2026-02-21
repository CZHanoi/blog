---
title: gsMap
date: 2026-02-4
cover: scenic.jpg
category:
  - code
tag:
  - scRNAseq
  - Goni2
star: true
article: true
---



## Install



```bash
mamba create -n gsMap python>=3.10
mamba install -c conda-forge "numpy<2" pandas scipy scikit-learn matplotlib seaborn tqdm pyyaml python-kaleido zarr bitarray jinja2 plotly scanpy scikit-misc pyarrow
mamba install -c conda-forge -c bioconda "bitarray<3" pyranges sorted_nearest
git clone https://github.com/JianYang-Lab/gsMap
cd gsMap
pip install -e .
```















```
# Trait: 26748-2.0
nohup bash /public/home/chenzhh/Ashoka/Goni2/02_gsmap_trait_step4_6.sh \
  26748-2.0 /cwStorage/nodecw_group/YL_data/new_image/GSMAP/gsmap_26748-2.0.tsv 200 \
  > /public/home/chenzhh/Ashoka/Goni2/logs/26748-2.0.step4_6.nohup.out 2>&1 &

# Trait: 26653-2.0
nohup bash /public/home/chenzhh/Ashoka/Goni2/02_gsmap_trait_step4_6.sh \
  26653-2.0 /cwStorage/nodecw_group/YL_data/new_image/GSMAP/gsmap_26653-2.0.tsv 200 \
  > /public/home/chenzhh/Ashoka/Goni2/logs/26653-2.0.step4_6.nohup.out 2>&1 &

# Trait: 27211-2.0
nohup bash /public/home/chenzhh/Ashoka/Goni2/02_gsmap_trait_step4_6.sh \
  27211-2.0 /cwStorage/nodecw_group/YL_data/new_image/GSMAP/gsmap_27211-2.0.tsv 200 \
  > /public/home/chenzhh/Ashoka/Goni2/logs/27211-2.0.step4_6.nohup.out 2>&1 &

# Trait: 27513-2.0
nohup bash /public/home/chenzhh/Ashoka/Goni2/02_gsmap_trait_step4_6.sh \
  27513-2.0 /cwStorage/nodecw_group/YL_data/new_image/GSMAP/gsmap_27513-2.0.tsv 200 \
  > /public/home/chenzhh/Ashoka/Goni2/logs/27513-2.0.step4_6.nohup.out 2>&1 &

# Trait: 26663-2.0
nohup bash /public/home/chenzhh/Ashoka/Goni2/02_gsmap_trait_step4_6.sh \
  26663-2.0 /cwStorage/nodecw_group/YL_data/new_image/GSMAP/gsmap_26663-2.0.tsv 200 \
  > /public/home/chenzhh/Ashoka/Goni2/logs/26663-2.0.step4_6.nohup.out 2>&1 &

```

## 皮层兴奋性神经元（GLU，谷氨酸能）

- **L2/3_IT_GLU**：皮层 **第2/3层** IT（皮层内在投射型，intratelencephalic）**谷氨酸能兴奋性神经元**
- **L4/5_IT_GLU**：皮层 **第4/5层** IT **谷氨酸能兴奋性神经元**
- **L5_IT_GLU**：皮层 **第5层** IT **谷氨酸能兴奋性神经元**
- **L5_PT_GLU**：皮层 **第5层** PT（锥体束型，pyramidal tract）**谷氨酸能投射神经元**
- **L5/6_NP_GLU**：皮层 **第5/6层** NP（近程投射型，near-projecting）**谷氨酸能兴奋性神经元**
- **L6_IT_GLU**：皮层 **第6层** IT **谷氨酸能兴奋性神经元**
- **L6_Car3_GLU**：皮层 **第6层** Car3 表达的 **谷氨酸能兴奋性神经元**
- **L6_N_GLU**：皮层 **第6/6b层** 皮质-丘脑（corticothalamic）或近程投射（near-projecting）**谷氨酸能神经元**

------

## 端脑（Telencephalon, TE）神经元

- **TE_N_GLU**：端脑 **谷氨酸能神经元**（兴奋性）
- **TE_N_GABA**：端脑 **GABA 能神经元**（抑制性）

### 端脑 GABA 神经元亚型（按经典标记基因命名）

- **TE_N_GABA_PVALB**：端脑 **Pvalb（副肌钙蛋白）阳性 GABA 能中间神经元**
- **TE_N_GABA_SST**：端脑 **Sst（生长抑素）阳性 GABA 能中间神经元**
- **TE_N_GABA_VIP**：端脑 **Vip（血管活性肠肽）阳性 GABA 能中间神经元**
- **TE_N_GABA_LAMP5**：端脑 **Lamp5 阳性 GABA 能中间神经元**
- **TE_N_GABA_SNCG**：端脑 **Sncg（γ-突触核蛋白）阳性 GABA 能中间神经元**
- **TE_N_GABA_RELN**：端脑 **Reln（Reelin）阳性 GABA 能中间神经元**
- **TE_N_GABA_CHODL**：端脑 **Chodl 阳性 GABA 能中间神经元**
- **TE_N_CHO**：端脑 **胆碱能（Cholinergic）神经元**（通常对应 ChAT/VAChT 系统）

------

## 间脑+中脑（Diencephalon + Mesencephalon, DIME）神经元

- **DIME_N_GLU**：间脑/中脑 **谷氨酸能神经元**
- **DIME_N_GABA**：间脑/中脑 **GABA 能神经元**
- **DIME_N_GAL**：间脑/中脑 **Galanin（加兰素）能神经元**
- **DIME_N_AVP**：间脑/中脑 **AVP（精氨酸加压素/抗利尿激素）能神经元**
- **DIME_N_HCRT**：间脑/中脑 **HCRT/Orexin（食欲素/下丘脑分泌素）能神经元**
- **DIME_N_DOP**：间脑/中脑 **多巴胺能神经元**

------

## 海马/嗅球/纹状体/后脑相关神经元

- **DG_N_GLU**：海马 **齿状回（Dentate Gyrus）谷氨酸能神经元**
- **CA1_N_GLU**：海马 **CA1 区谷氨酸能神经元**
- **CA3_N_GLU**：海马 **CA3 区谷氨酸能神经元**
- **OB_N_GABA**：**嗅球（Olfactory Bulb）GABA 能神经元**
- **STR_NBL**：**纹状体（Striatum）神经母细胞/未成熟神经元（Neuroblast-like）**
- **RH_N_SER**：**后脑/菱脑（Rhombencephalon）5-羟色胺（血清素）能神经元**
- **RH_N_GLU**：**后脑/菱脑（Rhombencephalon）谷氨酸能神经元**
- **CNU_N_GABA**：**大脑核团（cerebral nuclei）GABA 能神经元**

------

## 胶质细胞与血管/上皮相关细胞（非神经元）

- **ASC**：**星形胶质细胞（Astrocyte）**
- **OL**：**少突胶质细胞（Oligodendrocyte）**
- **OPC**：**少突胶质前体细胞（Oligodendrocyte precursor cell）**
- **MGL**：**小胶质细胞（Microglia）**
- **VLMC**：**血管-软脑膜细胞（Vascular leptomeningeal cells）**
- **EPC**：**室管膜细胞/室管膜上皮细胞（Ependymocyte/Ependymal cell）**
- **EDC**：通常指 **血管内皮细胞（Endothelial cell）**（在你这套“VLMC + EPC + CHOR”的组合里最常见的对应就是内皮；若你愿意贴一下该类在参考注释表里的英文描述/marker，我可以把它定得更死）
- **CHOR**：**脉络丛上皮细胞（Choroid plexus epithelial cell）**
- **HYPC**：该缩写在不同参考里可能指向不同上皮/室管膜相关细胞亚群；就你这套标签结构来看，多数情况下它对应 **下室管膜/室管膜相关上皮细胞亚群**（如果你把该类的 marker 基因或参考注释表那一行贴出来，我可以给到确定中文名）
