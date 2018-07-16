<?php require('../vendor/autoload.php');

use Sunra\PhpSimple\HtmlDomParser;
use Browser\Casper;

$table = [];
$bibox = $_POST;

try {
    $casper = new Casper();
    //May need to set more options due to ssl issues
    $casper->setOptions(array('ignore-ssl-errors' => 'yes'));
    $casper->start('https://www.pinnacle.com/m/Mobile/Sport/29');
    $casper->wait(1000);
    $output = $casper->getOutput();
    $casper->run();
    $html = $casper->getHtml();

    $dom = HtmlDomParser::str_get_html($html);

    $elements = $dom->find('div[class=panel-primary]');

    foreach ($elements as $el) {
        $country1 = trim($el->find('a[class=list-group-item]')[0]->find('span[class=line-selection]')[0]->text());
        if ($country1 == $bibox['country1']) {
            $table['x1'] = number_format(round((float)trim($el->find('a[class=list-group-item]')[0]->find('span[class=badge-odds]')[0]->text()), 2), 2);
            $table['x2'] = number_format(round((float)trim($el->find('a[class=list-group-item]')[2]->find('span[class=badge-odds]')[0]->text()), 2), 2);
            $table['draw'] = number_format(round((float)trim($el->find('a[class=list-group-item]')[1]->find('span[class=badge-odds]')[0]->text()), 2), 2);
            break;
        }
    }
} catch (Exception $e) {
    $table = ['error' => $e->getMessage()];
}

echo json_encode($table);