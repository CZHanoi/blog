---
title: Hanoi's Jupyter
date: 2025-11-13
cover: CRYCHIC.webp
category:
  - Oracle
tag:
  - Manager
star: true
article: true

---



## 运行

```bash
mamba activate base

nohup jupyter lab --port=2222 --no-browser 2>&1 >log_jupyter_2222nodecw7.log &
nohup jupyter lab --port=2019 --no-browser 2>&1 >log_jupyter_2019nodeyj1.log &
nohup jupyter lab --port=1513 --no-browser 2>&1 >log_jupyter_1513nodecw1.log &
nohup jupyter lab --port=8686 --no-browser 2>&1 >log_jupyter_8686nodecw2.log &
nohup jupyter lab --port=1705 --no-browser 2>&1 >log_jupyter_1705nodecw3.log &
nohup jupyter lab --port=1323 --no-browser 2>&1 >log_jupyter_1323nodecw4.log &
nohup jupyter lab --port=2216 --no-browser 2>&1 >log_jupyter_2216nodecw5.log &
nohup jupyter lab --port=2114 --no-browser 2>&1 >log_jupyter_2114nodecw6.log &
nohup jupyter lab --port=2222 --no-browser 2>&1 >jupyter_log/log_jupyter_2222nodecw7.log &
nohup jupyter lab --port=1919 --no-browser 2>&1 >log_jupyter_1919nodecw8.log &
nohup jupyter lab --port=9999 --no-browser 2>&1 >log_jupyter_9999gpucw1.log &
nohup jupyter lab --port=2019 --no-browser 2>&1 >log_jupyter_2019nodeyj1.log &
nohup jupyter lab --port=2122 --no-browser 2>&1 >log_jupyter_2122nodecw9.log &
nohup jupyter lab --port=1013 --no-browser 2>&1 >log_jupyter_1013nodecw10.log &
nohup jupyter lab --port=1614 --no-browser 2>&1 >log_jupyter_1614nodecw11.log &
nohup jupyter lab --port=1224 --no-browser 2>&1 >log_jupyter_1224nodecw12.log &
nohup jupyter lab --port=1330 --no-browser 2>&1 >log_jupyter_1330nodecw13.log &

```



```bash
python -m ipykernel install --user --name=merfish --display-name "Python310 (merfish)"
```

