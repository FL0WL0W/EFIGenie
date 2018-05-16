#include <QWidget>
#include <QLabel>
#include <QPushButton>
#include <QGridLayout>
#include <QMouseEvent>
#include <IConfigWidget.h>
#include <Functions.h>
#include "TableEditWidget.h"
#include <QDialog>

#ifndef Table1ConfigWidget_H
#define Table1ConfigWidget_H
class Table1ConfigWidget : public QWidget, public IConfigWidget
{
	Q_OBJECT
public:
	QLabel * Label;
	QPushButton * Button;
	int Decimals;
	std::string Type;
	double Multiplier;
	double *XMin;
	double *XRes;
	double *XMax;

	double LastInterpedXMin;
	double LastInterpedXRes;
	double LastInterpedXMax;

	void *config;

	~Table1ConfigWidget();
	Table1ConfigWidget(const char * label, std::string type, double *xMin, double *xRes, double *xMax, double multiplier);

	void Interpolated();

	void Interpolate();

	void * getValue();

	void setValue(void *val);

	void * getConfigValue();

	void setConfigValue(void *val);

	unsigned int configSize();

	bool isConfigPointer();

	std::string getConfigType();

	bool eventFilter(QObject *watched, QEvent *e);
};
#endif