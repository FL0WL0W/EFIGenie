#include "Table1ConfigWidget.h"

Table1ConfigWidget::~Table1ConfigWidget()
{
	delete config;
	delete Button;
	delete Label;
}

Table1ConfigWidget::Table1ConfigWidget(const char * label, std::string type, double *xMin, double *xRes, double *xMax, double multiplier)
{
	Multiplier = multiplier;
	Type = type;
	XMin = xMin;
	XRes = xRes;
	XMax = xMax;

	config = calloc(configSize(), configSize());

	Interpolated();

	QGridLayout *layout = new QGridLayout;
	layout->setSpacing(5);
	layout->setMargin(0);

	Label = new QLabel(QString(label));
	Label->setFixedSize(300, 25);
	layout->addWidget(Label, 0, 0);

	QLabel * padding = new QLabel(QString(""));
	padding->setFixedSize(100, 25);
	layout->addWidget(padding, 0, 2);

	Button = new QPushButton();
	Button->setText("Edit");
	Button->setFixedSize(100, 25);
	layout->addWidget(Button, 0, 1);
	Button->installEventFilter(this);

	setLayout(layout);
}

void Table1ConfigWidget::Interpolated()
{
	LastInterpedXMin = *XMin;
	LastInterpedXRes = *XRes;
	LastInterpedXMax = *XMax;
}

void Table1ConfigWidget::Interpolate()
{
	if (LastInterpedXMin == *XMin && LastInterpedXRes == *XRes && LastInterpedXMax == *XMax)
		return;//if we are up to date then we dont need to interp;
			   //TODO: interpolate the values
	delete config;
	config = calloc(configSize(), configSize());
	Interpolated();
}

void * Table1ConfigWidget::getValue()
{
	Interpolate();

	double * value = (double *)calloc(sizeof(double)* (*XRes), sizeof(double)* (*XRes));
	double * buildVal = value;
	void *buildConfig = config;
	for (int i = 0; i < *XRes; i++)
	{
		CopyTypeToLocationDouble(Type, buildVal, buildConfig);
		*buildVal *= Multiplier;
		buildConfig = (void *)((char*)buildConfig + SizeOfType(Type));
		buildVal++;
	}
	return value;
}

void Table1ConfigWidget::setValue(void *val)
{
	void *buildConfig = config;
	for (int i = 0; i < *XRes; i++)
	{
		double num = *(double *)val / Multiplier;
		CopyDoubleToLocationType(Type, buildConfig, &num);
		val = (void*)((double *)val + 1);
		buildConfig = (void *)((char*)buildConfig + SizeOfType(Type));
	}

	Interpolated(); //setting value so assume we are interpolated
}

void * Table1ConfigWidget::getConfigValue()
{
	Interpolate();
	return &config;
}

void Table1ConfigWidget::setConfigValue(void *val)
{
	memcpy(config, val, configSize());
	Interpolated(); //setting value so assume we are interpolated
}

unsigned int Table1ConfigWidget::configSize()
{
	return SizeOfType(Type) * (*XRes);
}

bool Table1ConfigWidget::isConfigPointer()
{
	return true;
}

std::string Table1ConfigWidget::getConfigType()
{
	return Type;
}

bool Table1ConfigWidget::eventFilter(QObject *watched, QEvent *e)
{
	if (e->type() == QEvent::MouseButtonRelease)
	{
		QMouseEvent* ev = (QMouseEvent*)e;
		if (ev->button() == Qt::LeftButton) {
			if (watched == Button)
			{
				Interpolate();//Interpolate before we open the dialog
				QDialog *dialog = new QDialog(this);
				QGridLayout *layout = new QGridLayout();

				void * widgetValue = getValue();

				TableEditWidget *editWidget = new TableEditWidget(*XRes, 1, *XMin, *XMax, getAccuracy(*XMin, *XMax), 0, 0, 0, widgetValue, 0, 100, 0);

				delete widgetValue;
				layout->addWidget(editWidget, 0, 0);
				layout->setMargin(0);

				dialog->setLayout(layout);
				dialog->resize(editWidget->width(), editWidget->height());
				dialog->exec();

				widgetValue = editWidget->getValue();

				setValue(widgetValue);
				delete widgetValue;
				delete editWidget;
				delete dialog;
			}
		}
	}
	return false;
}