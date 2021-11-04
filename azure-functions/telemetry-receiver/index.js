module.exports = async function (context, req) {
  const deviceId = req.query.device_id;
  const score = parseInt(req.body.score);
  const telemetry = { deviceId, score };

  context.log('telemetry: ', JSON.stringify(telemetry));
  context.bindings.outputEventHubMessage = telemetry;
}