#include <QWidget>
#include <QLabel>
#include <QPushButton>
#include <QGridLayout>
#include <QMouseEvent>
#include <IConfigWidget.h>
#include <Functions.h>

#ifndef Table2ConfigWidget_H
#define Table2ConfigWidget_H
class Table2ConfigWidget : public QWidget, public IConfigWidget
{
public:
	QLabel * Label;
	QPushButton * Button;
	int Decimals;
	std::string Type;
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

	Table2ConfigWidget(const char * label, std::string type, double *xMin, double *xRes, double *xMax, double *yMin, double *yRes, double *yMax)
	{
		Type = type;
		XMin = xMin;
		XRes = xRes;
		XMax = xMax;
		YMin = yMin;
		YRes = yRes;
		YMax = yMax;

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
				   //TOD: interpolate the values
	}

	void * getValue()
	{
		Interpolate();
		return &config;
	}

	void setValue(void *val)
	{
		memcpy(config, val, size());
		Interpolated(); //setting value so assume we are interpolated
	}

	unsigned int size()
	{
		return SizeOfType(Type) * (*XRes) * (*YRes);
	}

	bool isPointer()
	{
		return true;
	}

	std::string getType()
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
								  //TODO: add table dialog
				}
			}
		}
		return false;
	}
};
#endif