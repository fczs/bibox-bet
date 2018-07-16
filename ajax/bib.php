<?php require('../vendor/autoload.php');

use Sunra\PhpSimple\HtmlDomParser;
use Browser\Casper;

$table = [];

try {
    $casper = new Casper();
    //May need to set more options due to ssl issues
    $casper->setOptions(array('ignore-ssl-errors' => 'yes'));
    $casper->start('https://www.bibox.com/worldMain');
    $casper->wait(5000);
    $output = $casper->getOutput();
    $casper->run();
    $html = $casper->getHtml();

    $dom = HtmlDomParser::str_get_html($html);

    $elements = $dom->find('div[class=world-country-box]');

    foreach ($elements as $key => $el) {
        $box = $el->find('div[class=world-box-num]')[0];
        $lines = $box->find('div[class=world-num-box]');
        $countries = $lines[0]->find('div[class=text-center]');
        $bids = $lines[1]->find('div[class=text-center]');
        $table[$key]['date'] = $el->find('div[class=vs-country]')[0]->find('p[class=ts-14]')[0]->text();
        $table[$key]['country1'] = $countries[0]->text();
        $table[$key]['country2'] = $countries[2]->text();
        $table[$key]['x1'] = (int)str_replace(',', '', $bids[0]->text());
        $table[$key]['draw'] = (int)str_replace(',', '', $bids[1]->text());
        $table[$key]['x2'] = (int)str_replace(',', '', $bids[2]->text());
    }
} catch (Exception $e) {
    $table = ['error' => $e->getMessage()];
}

echo json_encode($table);