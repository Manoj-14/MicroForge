let _config = null;

export async function loadConfig() {
  if (!_config) {
    const res = await fetch('/config.json');
    _config = await res.json();
  }
  return _config;
}
