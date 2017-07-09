# routine

[![Build Status](https://travis-ci.org/OrKoN/routine.svg?branch=master)](https://travis-ci.org/OrKoN/routine)

A routing engine based on OSM data that is completely written in JavaScript and relying on quite many native modules. The status is: *completely experimental* and has a *minimal feature set* to demonstrate the approach.

![screenshots/routine.png](screenshots/routine.png)

## Architecture

Routing consists of an HTTP server to power the API and a farm of background workers running in separate processes. The workers are created via `fork` and, therefore, are able to share the memory where the graph is stored. The graph is stored in files and loaded into the workers in read-only mode via `mmap`.

## Performance

### Berlin OSM PBF import

```
INFO: Memory used 217 MB
INFO: Graph size 7.67 MB
INFO: Nodes in graph 77893
INFO: Edges in graph 274629
OK: Graph is created

real  0m22.475s
user  0m23.176s
sys 0m0.656s
```

### Stuttgart OSM BPF import

```
INFO: Memory used 883 MB
INFO: Graph size 37.5 MB
INFO: Nodes in graph 384299
INFO: Edges in graph 1337166
OK: Graph is created

real  1m5.906s
user  1m7.532s
sys 0m2.412s
```