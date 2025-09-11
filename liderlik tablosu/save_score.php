<?php
$data = json_decode(file_get_contents('php://input'), true);
$name = htmlspecialchars($data['name']);
$score = intval($data['score']);
$file = 'scores.json';
$scores = [];

if(file_exists($file)) {
    $scores = json_decode(file_get_contents($file), true);
}

$scores[] = ['name'=>$name, 'score'=>$score, 'date'=>date('Y-m-d H:i')];
usort($scores, fn($a,$b)=>$b['score']-$a['score']);
file_put_contents($file, json_encode($scores));

echo json_encode(['status'=>'success']);
?>
