# HP Metrics

Metrics for HP partners

## Getting Started

Download the [jQuery plugin][min] and place hp-metrics[.min].js and the hp-metrics[.min].css in the appropriate places.

[min]: https://github.com/colevoss/hp_metrics/tree/master/dist

###In your web page:
After including jquery, hp-metrics[.min].js and hp-metrics[.min].css place "_$.hpMetrics()_" inside a document.ready function somehwere in your javascripts.

Then add a hp-metrics data attribute to the button or link that will initialize HP Metrics modal whose value is a json representation of a vehicle.
```html
<head>
  <script src="jquery.js"></script>
  <script src="dist/hp-metrics.min.js"></script>
  <link rel="stylesheet" href="dist/hp-metrics.min.css" type="text/css" />
</head>
<body>
  <script>
    $(function(){
      $.hpMetrics();
    });
  </script>
  <button data-hp-metrics='{"year": "2014", "make": "Cadillac", "model": "ATS"}'></button>
</body>
```
This should prepare the button to display the HP Metrics modal when clicked.

## Documentation
### Customization
You can determin how the HP Metrics modal enters the screen by setting parameters such as:
_*defaults in bold italics_
* entrace: [slide, _**fade**_]
* startPlacement: [_**top**_, left, right, bottom]
* speed: [_**fast**_, slow, 100-1000]
```javascript
  $(function(){
    $.hpMetrics({
      entrance: 'slide', // Modal slides into view
      startPlacement: 'left', // Modal slides from the left side of the screen.
      speed: 500 // Medium speed.
    })
  });
```

### How It Works
When the button with the hp-metrics data attribute is clicked, the user will be directed to Honest Policy partners after appropriate modals are presented.
