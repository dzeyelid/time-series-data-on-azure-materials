# monitor-obniz-on-azure-sample

## obniz から変化のイベントを受け取る

- webhook 型は、Azure Functions の http トリガで待ち受け
- websocket 型は Azure Web App でホスト

## 定期的にデータを取得する（時系列データ）

- Azure Functions のタイマートリガ → Iot Hub → Time Series Insights
