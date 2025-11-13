---
title: Hanoi's Jupyter
date: 2025-11-13
cover: scenic.jpg
category:
  - Others
tag:
  - Manager
star: true
article: true

---

# 运行

```
mamba activate base

nohup jupyter lab --port=2222 --no-browser 2>&1 >log_jupyter_2222nodecw7.log &
nohup jupyter lab --port=2019 --no-browser 2>&1 >log_jupyter_2019nodeyj1.log &
```

