#include <QWidget>
#include <QLabel>
#include <QPushButton>
#include <QGridLayout>
#include <QMouseEvent>
#include <QDialog>
#include <IConfigWidget.h>
#include <Functions.h>
#include "TableEditWidget.h"
#include "math.h"

#ifndef Table2ConfigWidget_H
#define Table2ConfigWidget_H
int getAccuracy(double minNum, double maxNum)
{
	int maxLog = log(maxNum);
	int l = 3 - maxLog;
	if (l > 0)
		return l;
	return 0;
}

class Table2ConfigWidget : public QWidget, public IConfigWidget
{
public:
	QLabel * Label;
	QPushButton * Button;
	int Decimals;
	std::string Type;
	double Multiplier;
	double *XMin;
	double *XRes;
	double *XMax;
	double *YMin;
	double *YRes;
	double *YMax;

	double LastInterpedXMin;
	double LastInterpedXRes;
	double LastInterpedXMax;
	double LastInterpedYMin;
	double LastInterpedYRes;
	double LastInterpedYMax;

	void *config;

	Table2ConfigWidget(const char * label, std::string type, double multiplier, double *xMin, double *xRes, double *xMax, double *yMin, double *yRes, double *yMax)
	{
		Type = type;
		Multiplier = multiplier;
		XMin = xMin;
		XRes = xRes;
		XMax = xMax;
		YMin = yMin;
		YRes = yRes;
		YMax = yMax;

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

	void Interpolated()
	{
		LastInterpedXMin = *XMin;
		LastInterpedXRes = *XRes;
		LastInterpedXMax = *XMax;
		LastInterpedYMin = *YMin;
		LastInterpedYRes = *YRes;
		LastInterpedYMax = *YMax;
	}

	void Interpolate()
	{
		if (LastInterpedXMin == *XMin && LastInterpedXRes == *XRes && LastInterpedXMax == *XMax && LastInterpedYMin == *YMin && LastInterpedYRes == *YRes && LastInterpedYMax == *YMax)
			return;//if we are up to date then we dont need to interp;
				   //TODO: interpolate the values
		config = calloc(configSize(), configSize());
		Interpolated();
	}

	void * getValue()
	{
		Interpolate();

		double * value = (double *)calloc(sizeof(double)* (*XRes) * (*YRes), sizeof(double)* (*XRes) * (*YRes));
		double * buildVal = value;
		void *buildConfig = config;
		for (int i = 0; i < *XRes; i++)
		{
			for (int j = 0; j < *YRes; j++)
			{
				CopyTypeToLocationDouble(Type, buildVal, buildConfig);
				*buildVal *= Multiplier;
				buildConfig = (void *)((char*)buildConfig + SizeOfType(Type));
				buildVal++;
			}
		}
		return value;
	}

	void setValue(void *val)
	{
		void *buildConfig = config;
		for (int i = 0; i < *XRes; i++)
		{
			for (int j = 0; j < *YRes; j++)
			{
				double num = *(double *)val / Multiplier;
				CopyDoubleToLocationType(Type, buildConfig, &num);
				val = (void*)((double *)val + 1);
				buildConfig = (void *)((char*)buildConfig + SizeOfType(Type));
			}
		}

		Interpolated(); //setting value so assume we are interpolated
	}

	void * getConfigValue()
	{
		Interpolate();
		return &config;
	}

	void setConfigValue(void *val)
	{
		memcpy(config, val, configSize());
		Interpolated(); //setting value so assume we are interpolated
	}

	unsigned int configSize()
	{
		return SizeOfType(Type) * (*XRes) * (*YRes);
	}

	bool isConfigPointer()
	{
		return true;
	}

	std::string getConfigType()
	{
		return Type;
	}

	bool eventFilter(QObject *watched, QEvent *e)
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

					TableEditWidget *editWidget = new TableEditWidget(*XRes, *YRes, *XMin, *XMax, getAccuracy(*XMin, *XMax), *YMin, *YMax, getAccuracy(*YMin, *YMax), getValue(), 0, 100, 0);
					layout->addWidget(editWidget, 0, 0);
					layout->setMargin(0);

					dialog->setLayout(layout);
					dialog->resize(editWidget->width(), editWidget->height());
					dialog->exec();

					setValue(editWidget->getValue());
					delete editWidget;
				}
			}
		}
		return false;
	}
};
#endif