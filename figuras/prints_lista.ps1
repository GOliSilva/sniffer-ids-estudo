# Prints de "lista com filtro": abre cada captura no Wireshark (perfil site_prova) com o filtro e o
# pacote já escolhidos, salva o print da janela em public/img/ e fecha.
#
#   powershell -ExecutionPolicy Bypass -File figuras\prints_lista.ps1
#
# Não mexe em outras janelas do Wireshark: só fecha a que ele mesmo abriu.

$WS = "C:\Program Files\Wireshark\Wireshark.exe"
$SITE = Split-Path -Parent $PSScriptRoot
$PROJ = Split-Path -Parent $SITE
$AULA = Join-Path $PROJ "aula_ids\capturas"
$SIM = Join-Path $PROJ "prova\codigo\capturas"

# nome do PNG, pasta, captura, filtro, pacote a selecionar
$lista = @(
    @("ws_base_lista",   $SIM,  "linha_de_base", "modbus || s7comm", 1),
    @("ws_aula01_lista", $AULA, "caso_01", "ip.addr == 192.168.0.50", 298),
    @("ws_aula02_lista", $AULA, "caso_02", "modbus.exception_code", 4),
    @("ws_aula03_lista", $AULA, "caso_03", "s7comm.header.errcls != 0 || ip.addr == 192.168.0.77", 365),
    @("ws_aula04_lista", $AULA, "caso_04", "s7comm.param.func != 0x04", 394),
    @("ws_aula05_lista", $AULA, "caso_05", "arp", 180),
    @("ws_aula06_lista", $AULA, "caso_06", "tcp.analysis.flags || arp", 217),
    @("ws_aula07_lista", $AULA, "caso_07", "s7comm.header.rosctr==3 && s7comm.data.returncode != 0xff", 5),
    @("ws_aula08_lista", $AULA, "caso_08", "modbus || (tcp.srcport==502 && tcp.flags==0x010)", 190),
    @("ws_aula09_lista", $AULA, "caso_09", "mbtcp.unit_id != 1", 261),
    @("ws_aula10_lista", $AULA, "caso_10", "modbus.func_code != 3", 321),
    @("ws_sim01_lista",  $SIM,  "caso_01", "mbtcp.unit_id != 1", 270),
    @("ws_sim02_lista",  $SIM,  "caso_02", "modbus.response_time > 0.05", 188),
    @("ws_sim03_lista",  $SIM,  "caso_03", "modbus.func_code != 3", 321),
    @("ws_sim04_lista",  $SIM,  "caso_04", "modbus.func_code != 3", 228),
    @("ws_sim05_lista",  $SIM,  "caso_05", "modbus.regval_uint16 == 32767", 230),
    @("ws_sim06_lista",  $SIM,  "caso_06", "mbtcp.prot_id != 0 || (tcp.srcport==502 && tcp.flags==0x010)", 375),
    @("ws_sim07_lista",  $SIM,  "caso_07", "modbus && ip.src==192.168.0.11 && !modbus.request_frame", 288),
    @("ws_sim08_lista",  $SIM,  "caso_08", "modbus.exception_code", 179),
    @("ws_sim09_lista",  $SIM,  "caso_09", "modbus.func_code == 43", 357),
    @("ws_sim10_lista",  $SIM,  "caso_10", "ip.addr == 192.168.0.66", 409)
)

foreach ($item in $lista) {
    $nome, $pasta, $cap, $filtro, $pacote = $item
    $arq = Join-Path $pasta "$cap.pcap"
    $proc = Start-Process $WS -ArgumentList "-C site_prova -r `"$arq`" -Y `"$filtro`" -g $pacote" -PassThru
    Start-Sleep -Seconds 6
    & powershell -ExecutionPolicy Bypass -File (Join-Path $PSScriptRoot "print_janela.ps1") -Titulo "$cap.pcap" -Ajustar | Out-Null
    Start-Sleep -Seconds 2
    & powershell -ExecutionPolicy Bypass -File (Join-Path $PSScriptRoot "print_janela.ps1") -Titulo "$cap.pcap" -Nome $nome
    Stop-Process -Id $proc.Id -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 1
}
