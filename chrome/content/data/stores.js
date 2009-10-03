var stores = [
  {
    name: 'bookmooch',
    title: 'Book Mooch',
    link: 'http://bookmooch.com/detail/#{ISBN}',
    query: 'http://bookmooch.com/api/moochable?asins=#{ISBN}',
    process: function(req, isbn) {
      if (req.responseText.toLowerCase().match(isbn.toLowerCase())) {
        return 'moochable';
      } else {
        return '';
      }
    }
  },
  {
    name: 'librarything',
    title: 'Library Thing',
    link: 'http://www.librarything.com/isbn/#{ISBN}',
    process: function(req, isbn) {
      if (req.responseText.match('No works found')) {
        return '';
      }
      return 'view';
    }
  },
  {
    name: 'paperbackswap',
    title: 'PaperBackSwap',
    link: 'http://www.paperbackswap.com/book/details/#{ISBN}',
    query: 'http://www.paperbackswap.com/api/v1/index.php?RequestType=ISBNList&ISBN=#{ISBN}',
    process: function(req, isbn) {
      var result = req.responseXML.getElementsByTagName('Available');
      if ((result.length == 1) && (result[0].textContent.match('true'))) {
        return 'available';
      }
      return '';
    }
  },
  {
    name: 'shelfari',
    title: 'Shelfari',
    link: 'http://www.shelfari.com/booksearch.aspx?Adv=True&SearchAmazon=False&Title=&Author=&Isbn=#{ISBN}',
    process: function(req, isbn) {
      if (req.responseText.match('We found 1 book matching')) {
        return 'expore';
      }
      return '';
    }
  },
  {
    name: 'abebooks',
    title: 'Abebooks',
    link: 'http://www.abebooks.com/servlet/SearchResults?isbn=#{ISBN}',
    affiliate_link: 'http://clickserve.cc-dt.com/link/tplclick?lid=41000000024660875&pubid=21000000000131337&isbn=#{ISBN}',
    query: "http://search.abebooks.com/?isbn=#{ISBN}&ordr=2",
    match: /PRIC\|(.*)/
  },
  {
    name: 'alibris',
    title: 'Alibris',
    affiliate_link: "http://click.linksynergy.com/fs-bin/click?id=qz*/NhQgUlY&offerid=99238.122856000&type=2&tmpid=939&RD_PARM1=http%253A%252F%252Fwww.alibris.com/booksearch%253Fqsort%253Dp%2526qisbn%253D#{ISBN_UPCASE}",
    link: 'http://www.alibris.com/booksearch?qsort=p&qisbn=#{ISBN_UPCASE}',
    query: 'http://partnersearch.alibris.com/cgi-bin/search?site=23615740&qisbn=#{ISBN_UPCASE}',
    process: function(req) {
      var response = '';
      var prices = req.responseXML.getElementsByTagName('price');
      for (var i=0; i<prices.length; i++) {
        if (response == '') {
          response = '$' + prices[i].childNodes[0].nodeValue;
        }
        else {
          var last = parseFloat(response.slice(1));
          if (last > parseFloat(prices[i].childNodes[0].nodeValue)) {
            response = '$' + prices[i].childNodes[0].nodeValue;
          }
        }
      }
      return response;
    }
  },
  {
    name: 'amazon',
    title: 'Amazon',
    affiliate_link: "http://www.amazon.com/exec/obidos/ASIN/#{ISBN_UPCASE}/anotherjesse-20",
    link: 'http://www.amazon.com/exec/obidos/ASIN/#{ISBN_UPCASE}',
    query: "http://bookburro.appspot.com/?isbn=#{ISBN_UPCASE}",
    process: function(req) {
      var prices = req.responseXML.getElementsByTagName('FormattedPrice');
      for (var i=0; i<prices.length; i++) {
        if (prices[i].parentNode.nodeName == 'Price') {
          return prices[i].childNodes[0].nodeValue;
        }
      }
      return '';
    }
  },
  {
    name: 'amazon_marketplace',
    title: 'Amazon Marketplace',
    affiliate_link: "http://www.amazon.com/exec/obidos/redirect?tag=anotherjesse-20&path=tg/stores/offering/list/-/#{ISBN_UPCASE}/all/",
    link: "http://www.amazon.com/gp/offer-listing/#{ISBN_UPCASE}/",
    query: "http://bookburro.appspot.com/?isbn=#{ISBN_UPCASE}",
    process: function(req) {
      var response = '';
      var prices = req.responseXML.getElementsByTagName('FormattedPrice');
      for (var i=0; i<prices.length; i++) {
        if (prices[i].parentNode.nodeName != 'Price') {
          if (response == '') {
            response = prices[i].childNodes[0].nodeValue;
          }
          else {
            var last = parseFloat(response.slice(1));
            if (last > parseFloat(prices[i].childNodes[0].nodeValue.slice(1))) {
              response = prices[i].childNodes[0].nodeValue;
            }
          }
        }
      }
      return response;
    }
  },
  {
    name: 'booksamillion',
    title: 'Books A Million',
    link: "http://www.booksamillion.com/ncom/books?isbn=#{ISBN}",
    process: function(req) {
      if (req.responseText.match(/Not Available/)) return '';
      var price = req.responseText.match(/Club Price: ([^<]*)</);
      if (price) {
        return price[1];
      }
    }
  },
  {
    name: 'barnesnoble',
    title: 'Barnes & Noble',
    link: 'http://search.barnesandnoble.com/booksearch/isbninquiry.asp?isbn=#{ISBN}',
    affiliate_link: 'http://search.barnesandnoble.com/booksearch/isbninquiry.asp?isbn=#{ISBN}&afsrc=1&lkid=J27115602&pubid=K131337&byo=1',
    query: 'http://search.barnesandnoble.com/booksearch/isbninquiry.asp?isbn=#{ISBN}',
    process: function(req) {
      // </li><li><strong>$34.99</strong> Online price
      try {
        return req.responseText.match(/<strong>(\$[0-9.]*)<\/strong> Online price/)[1];
      } catch (e) {}
    }
  },
  {
    name: 'barnesnoble_member',
    title: 'Barnes & Noble Member',
    link: 'http://search.barnesandnoble.com/booksearch/isbninquiry.asp?isbn=#{ISBN}',
    affiliate_link: 'http://search.barnesandnoble.com/booksearch/isbninquiry.asp?isbn=#{ISBN}&afsrc=1&lkid=J27115602&pubid=K131337&byo=1',
    query: 'http://search.barnesandnoble.com/booksearch/isbninquiry.asp?isbn=#{ISBN}',
    process: function(req) {
      // <strong style="text-decoration: none;">$35.99</strong></span> Member price
      try {
        return req.responseText.match(/<strong[^>]*>(\$[0-9.]*)<\/strong><\/span> Member price/)[1];
      } catch (e) {}
    }
  },
  {
    name: 'buy',
    title: 'Buy',
    link: "http://www.buy.com/retail/GlobalSearchAction.asp?qu=#{ISBN}",
    process: function(req) {

      if (req.responseText.match('did not return an exact match.')) {
        return '';
      }

      // <td style="padding-top:1px;line-height:15px;" align="center"><nobr><b>Our Low Price: </b><span class="adPrice"><b>$28.34</b></span>&nbsp; </nobr></td>
      // <td align="center"><b>Low Price: </b><b class='adPrice'>$8.48</b></td></tr></table></div></td>
      var price = req.responseText.match(/Low Price: <\/b><[^>]*class=['"]+adPrice['"]+[^>]*>[<b>]*(\$[0-9.]*)</);
      if (price) {
        return price[1];
      }
    }
  },
  {
    name: 'half',
    title: 'Half.com',
    link:  'http://search.half.ebay.com/ws/web/HalfSearch?m=books&isbn=#{ISBN}&submit=Search',
    match: /Best[^P]*Price[^\$]*([^<]*)</
  },
  {
    name: 'powells',
    title: 'Powells',
    link: "http://www.powells.com/biblio?isbn=#{ISBN}",
    affiliate_link: "http://www.powells.com/cgi-bin/partner?partner_id=29743&cgi=product&isbn=#{ISBN}",
    query: 'http://www.powells.com/search/linksearch?isbn=#{ISBN}',
    process: function( req ) {
    var price = '';
    var results = req.responseText.match(/\nPrice: [^\n]*/g);
    if (results) {
      for (var i=0; i<results.length; i++) {
        var currentprice = results[i].substring(8,20);
        if (i==0) {
          price = currentprice;
        } else {
          if (price - currentprice > 0) price = currentprice;
        }
      }
    }
    if (price) return '$'+price;
    return '';
    }
  }
];