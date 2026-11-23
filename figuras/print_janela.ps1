# Salva o print de uma janela (achada pelo título) em public/img/<nome>.png.
#
#   powershell -ExecutionPolicy Bypass -File figuras\print_janela.ps1 -Titulo "linha_de_base" -Nome ws_base_lista
#   ... -Titulo "Conversations" -Nome ws_conversas          (janela de estatística do Wireshark)
#   ... -Titulo "linha_de_base" -Ajustar                     (só põe a janela principal em 1400 x 900)
#
# -Titulo é um trecho do título da janela (sem diferenciar maiúsculas).
param(
    [Parameter(Mandatory = $true)][string]$Titulo,
    [string]$Nome = "",
    [switch]$Ajustar,
    [int]$Largura = 1400,
    [int]$Altura = 900
)

Add-Type -AssemblyName System.Drawing
Add-Type @"
using System;
using System.Text;
using System.Runtime.InteropServices;
public class Janelas {
    public delegate bool EnumProc(IntPtr h, IntPtr p);
    [DllImport("user32.dll")] public static extern bool EnumWindows(EnumProc f, IntPtr p);
    [DllImport("user32.dll")] public static extern bool IsWindowVisible(IntPtr h);
    [DllImport("user32.dll", CharSet = CharSet.Unicode)] public static extern int GetWindowText(IntPtr h, StringBuilder s, int n);
    [DllImport("user32.dll")] public static extern bool SetProcessDPIAware();
    [DllImport("user32.dll")] public static extern bool SetForegroundWindow(IntPtr h);
    [DllImport("user32.dll")] public static extern bool ShowWindow(IntPtr h, int c);
    [DllImport("user32.dll")] public static extern bool MoveWindow(IntPtr h, int x, int y, int w, int a, bool r);
    [DllImport("user32.dll")] public static extern bool PrintWindow(IntPtr h, IntPtr dc, uint f);
    [DllImport("user32.dll")] public static extern bool GetWindowRect(IntPtr h, out RECT r);
    [DllImport("dwmapi.dll")] public static extern int DwmGetWindowAttribute(IntPtr h, int a, out RECT r, int n);
    [StructLayout(LayoutKind.Sequential)] public struct RECT { public int Left, Top, Right, Bottom; }
}
"@
[Janelas]::SetProcessDPIAware() | Out-Null

$achadas = New-Object System.Collections.ArrayList
$cb = [Janelas+EnumProc]{
    param($h, $p)
    if ([Janelas]::IsWindowVisible($h)) {
        $sb = New-Object System.Text.StringBuilder 512
        [Janelas]::GetWindowText($h, $sb, 512) | Out-Null
        $t = $sb.ToString()
        if ($t -and $t -match [regex]::Escape($Titulo)) { [void]$achadas.Add(@{ h = $h; t = $t }) }
    }
    return $true
}
[Janelas]::EnumWindows($cb, [IntPtr]::Zero) | Out-Null
if ($achadas.Count -eq 0) { Write-Output "ERRO: nenhuma janela com '$Titulo' no título"; exit 1 }
if ($achadas.Count -gt 1) {
    Write-Output "Mais de uma janela casou; usando a primeira:"
    $achadas | ForEach-Object { Write-Output ("  " + $_.t) }
}
$h = $achadas[0].h
Write-Output ("janela: " + $achadas[0].t)

if ($Ajustar) {
    [Janelas]::ShowWindow($h, 9) | Out-Null          # restaura se estiver maximizada
    [Janelas]::MoveWindow($h, 40, 40, $Largura, $Altura, $true) | Out-Null
    [Janelas]::SetForegroundWindow($h) | Out-Null
    Write-Output "ajustada para $Largura x $Altura"
    exit 0
}

[Janelas]::SetForegroundWindow($h) | Out-Null
Start-Sleep -Milliseconds 400
# PrintWindow desenha a janela mesmo com outra por cima (2 = conteúdo completo, inclusive Qt)
$j = New-Object Janelas+RECT
[Janelas]::GetWindowRect($h, [ref]$j) | Out-Null
$r = New-Object Janelas+RECT
[Janelas]::DwmGetWindowAttribute($h, 9, [ref]$r, 16) | Out-Null   # 9 = borda visível, sem sombra
$W = $j.Right - $j.Left; $A = $j.Bottom - $j.Top
$tudo = New-Object System.Drawing.Bitmap $W, $A
$gt = [System.Drawing.Graphics]::FromImage($tudo)
$dc = $gt.GetHdc()
[Janelas]::PrintWindow($h, $dc, 2) | Out-Null
$gt.ReleaseHdc($dc); $gt.Dispose()
# corta a sombra invisível em volta (diferença entre GetWindowRect e a borda visível)
$x0 = $r.Left - $j.Left; $y0 = $r.Top - $j.Top
$w = $r.Right - $r.Left; $a = $r.Bottom - $r.Top
$bmp = $tudo.Clone((New-Object System.Drawing.Rectangle $x0, $y0, $w, $a), $tudo.PixelFormat)
$tudo.Dispose()
$g = [System.Drawing.Graphics]::FromImage($bmp)
$destino = Join-Path (Split-Path -Parent $PSScriptRoot) "public\img\$Nome.png"
$bmp.Save($destino, [System.Drawing.Imaging.ImageFormat]::Png)
$g.Dispose(); $bmp.Dispose()
Write-Output "salvo: $destino ($w x $a)"
