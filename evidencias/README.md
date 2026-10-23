# Evidências da migração para Kubernetes

Prints a tirar durante a demonstração (ver passo a passo completo em `README.md`,
seção "Kubernetes (Minikube)"). Salve cada print nesta pasta com o nome sugerido.

1. `01-minikube-start.png` — saída do `minikube start` concluído com sucesso.
2. `02-image-build.png` — saída dos dois comandos de build das imagens (`backend:k8s` e `frontend:k8s`).
3. `03-kubectl-apply.png` — saída do `kubectl apply -f k8s/` aplicando todos os manifestos.
4. `04-get-pods-wide.png` — saída de `kubectl get pods -o wide` mostrando 3 réplicas do backend,
   2 do frontend e 1 do MySQL, todas `Running`/`READY`, com os IPs e nodes.
5. `05-get-services.png` — saída de `kubectl get services` mostrando `frontend-service` como
   `NodePort` (30080) e `backend-service`/`mysql-service` como `ClusterIP`.
6. `06-get-deployments.png` — saída de `kubectl get deployments` com `READY` igual ao total de réplicas.
7. `07-navegador-login.png` — tela de login da aplicação aberta via `minikube service frontend-service`
   (ou `http://<minikube-ip>:30080`).
8. `08-navegador-estoque.png` — tela de estoque logada, provando que o frontend conversa com o
   backend através do proxy `/api/`.
9. `09-teste-balanceamento.png` — várias chamadas a `/api/health` (ex.: `curl` em loop) mostrando o
   cabeçalho `X-Pod` e/ou o campo `pod` variando entre os diferentes Pods do backend.
10. `10-delete-pod.png` — saída de `kubectl delete pod <nome-do-pod-backend>`.
11. `11-pod-recriado.png` — novo `kubectl get pods -o wide` mostrando o Deployment recriando
    automaticamente o Pod excluído (nome novo, idade recente).
12. `12-logs-pod.png` (opcional) — `kubectl logs <pod>` do backend mostrando o servidor no ar.
