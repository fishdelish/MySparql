// HTML Generating functions

var create_table_item = function(value, item_type) {
  var item = $("<" + item_type + "/>")
  item.text(value)
  return item;
};

var create_table_row = function(values, item_type) {
  var row = $("<tr/>")
  $.each(values, function(index, value) {
    row.append(create_table_item(value, item_type));
  });
  return row;
};

var create_table_html = function(headers, values) {
  var table = $("<table/>");
  table.append(create_table_row(headers, "th"));
  $.each(values, function(index, item) {
    table.append(create_table_row(item, "td"));
  });
  return table;
};

var collapse_results = function(data) {
  var order = [];
  var results = [];
  $.each(data.head.vars, function(index, var_name) {
    order.push(var_name);
  });
  $.each(data.results.bindings, function(index, result) {
    var result_row = [];
    $.each(order, function(index, binding) {
      result_row.push(result[binding].value);
    });
    results.push(result_row);
  });
  return results;
};

var create_errors = function(errors) {
  var error_box = $("<span style='color:red;' />")
  error_box.append("Error:");
  $.each(errors, function(index, error) {
    error_box.append($("<br/>"))
    error_box.append(error);
  });
  return error_box;
};

var create_table = function(data) {
      if (data.warnings != undefined) {
        return create_errors(data.warnings)
      }
      return create_table_html(data.head.vars, collapse_results(data));
};
var create_submit_button = function() {
  return $('<input type="submit" value="Run Query" />')
}

var create_label = function(for_input, label_text) {
  var label = $('<label for="' + for_input + '" />')
  label.text(label_text)
  return label;
}

var create_textarea = function(query) {
  var textarea = $('<textarea name="query" style="width:400px;height:100px;" />')
  textarea.val(query)
  return textarea;
}

var create_query_id = function(query_id) {
  return $('<input type="hidden" name="query_id" value="' + query_id + '" />');
}

var create_results_header = function() {
  var header = $('<span/>')
  header.text("Results")
  return header;
}

var create_results_area = function() {
  return $('<div class="results" />')
}

var create_break = function() {
  return $('<br/>')
}

var create_query_form = function(query_id, data) {
  var form = $('<form id="query-' + query_id + '" method="post" onsubmit="return submit_tutorial_box($(this), \'' + query_id + '\');" />')
  form.append(create_label("query", "Query"));
  form.append(create_break());
  form.append(create_textarea(data["query"]["query"]));
  form.append(create_break());
  form.append(create_query_id(query_id));
  form.append(create_submit_button());
  form.append(create_break());
  form.append(create_results_header());
  form.append(create_break());
  form.append(create_results_area());
  return form;
}

var create_parameter_box = function (form, param) {
  form.append(create_label(param, param));
  form.append($('<input name="' + param + '" type="text" />'));
};

var create_parameter_form = function(query_id, data) {
  var form = $('<form id="param-' + query_id + '" method="post" />')
  $.each(data.parameters, function(index, param) {
    form.append(create_parameter_box(form, param));
    form.append(create_break());
  });
  form.append(create_break());
  form.append(create_submit_button());
  form.append(create_break());
  form.append(create_results_header());
  form.append(create_break());
  form.append(create_results_area());
  return form;
}

// Utility functions

var send_form_data = function(form, success_func, error_func, url) {
  $.ajax({type : "POST", data : form.serialize(), dataType : "json", success : success_func, error : error_func, url : url});
}

var error_func = function(selector) {
  return function() {
    $(selector).html("<span style='color:red;'>An error occurred</span>");
  };
};

var set_loading_status = function(selector) {
  $(selector).html(mysparql_loading);
}

var submit_tutorial_box = function(event, query_id) {
  var url = mysparql_path + '/queries/run'
  var results_selector = "#query-" + query_id + " .results"
  var success_func = function(data) {
    $(results_selector).html(create_table(data))
  };
  set_loading_status(results_selector);
  send_form_data(event, success_func, error_func("#query-" + query_id + " .results"), url);
  return false;
};

// Parameter Loading

var parameter_query = function(query, data, formatter) {
  var query_id = $(query).attr("href")
  var query_type = $(query).attr("data-formatter");
  var form = create_parameter_form(query_id, data, query_type);
  form.submit(function() {
    var url = mysparql_path + '/queries/' + query_id + '/param_query'
    if (query_type == "tutorial") {
      url += "?tutorial"
    }
    var success_func = function(data) {
      var box = $("#param-" + query_id + " .results");
      box.html("<div/>")
      formatter($("#param-" + query_id + " .results div"), query_id, data);
    };
    var error_func = function() {
      $("#param-" + query_id + " .results div").html("<span style='color:red;'>Error occured</span>")
    }

    $("#param-" + query_id + " .results").html(mysparql_loading)
    $.ajax({type : "POST", data : $(form).serialize(), dataType : "json", success : success_func, url : url, error: error_func});
    return false;
  });

  $(query).replaceWith(form);
};

// Formatters

var tutorial_formatter = function(query, query_id, data) {
  var form = create_query_form(query_id, data);
  $(query).replaceWith(form);
  submit_tutorial_box(form, query_id)
};

var table_formatter = function(query, query_id, data) {
      $(query).replaceWith(create_table(data));
};

var xslt_formatter = function(query, query_id, data) {
  $(query).replaceWith(data)
};

// MySparql loading

$(document).ready(function() {
  $(".mysparql").each(function(index, query) {
    var query_id = $(query).attr("href")
    var query_type = $(query).attr("data-formatter")
    var formatter;
    var url;
    var dataType;
    //Determine which formatter to use and set that formatter up
    switch (query_type) {
      case "tutorial":
        dataType = "json"
        formatter = tutorial_formatter;
        url = mysparql_path + "/queries/" + query_id + "?tutorial"
        break;
      case "table":
        dataType = "json"
        formatter = table_formatter;
        url = mysparql_path + "/queries/" + query_id
        break;
      case "xslt":
        url = mysparql_path + "/queries/" + query_id
        dataType = "html"
        formatter = xslt_formatter;
        break;
      default:
        dataType = "json"
        formatter = table_formatter;
        url = mysparql_path + "/queries/" + query_id
        break;
    };

    //Construct the success callback.
    var success_func = function(data) {
      if(data.parameters) {
        parameter_query(query, data, formatter);
      } else {
        formatter(query, query_id, data);
      }
    };

    var error_func = function() {
      $(query).html("Error")
    }

    //Set up the mysparql link to indicate status and to deactivate clicking the link
    $(query).html(mysparql_loading)
    $(query).click(function() {return false;});
    $.ajax({type: "GET", url: url, success: success_func, dataType: dataType, error: error_func});  
  });
});

