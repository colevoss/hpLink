# HP Metrics

Metrics for HP partners

## Getting Started

Download the [production version][min] or the [development version][max].

[min]: https://github.com/colevoss/hp_metrics/blob/master/dist/scripts/hp-metrics.min.js
[max]: https://github.com/colevoss/hp_metrics/blob/master/dist/scripts/hp-metrics.js

###In your web page:
After including jquery and hp-metrics.[min.]js place "_$.hpMetrics()_" inside a document.ready function somehwere in your javascripts.

Then add a hp-metrics data attribute to the button or link that will initialize HP Metrics modal whose value is a json representation of a vehicle.
```html
<script src="jquery.js"></script>
<script src="dist/hp-metrics.min.js"></script>
<script>
  $(function(){
    $.hpMetrics();
  });
</script>
<button data-hp-metrics='{"year": "2014", "make": "Cadillac", "model": "ATS"}'></button>
```
This should prepare the button to display the HP Metrics modal when clicked.

## Documentation
### Customization
You can determin how the HP Metrics modal enters the screen by setting parameters such as:
_*defaults in bold italics_
* entrace: [slide, _**fade**_]
* startPlacement: [_**top**_, left, right, bottom]
* speed: [_**fast**_, slow, 100-1000]
