<?php
$file = 'scores.json';
$scores = [];

// JSON dosyası yoksa oluştur
if(!file_exists($file)) {
    file_put_contents($file, json_encode([]));
}

// Dosyayı oku
$data = json_decode(file_get_contents('php://input'), true);
$name = htmlspecialchars($data['name']);
$score = intval($data['score']);

$scores = json_decode(file_get_contents($file), true);

// Yeni skoru ekle
$scores[] = ['name'=>$name,'score'=>$score,'date'=>date('Y-m-d H:i')];

// Skorları yüksekten düşüğe sırala
usort($scores, fn($a,$b)=>$b['score']-$a['score']);

// JSON’a yaz
file_put_contents($file, json_encode($scores));

echo json_encode(['status'=>'success']);
?>
