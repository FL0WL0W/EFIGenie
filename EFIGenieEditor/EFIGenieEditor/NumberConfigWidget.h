#include <QWidget>
#include <QLabel>
#include <QDoubleSpinBox>
#include <QGridLayout>
#include <IConfigWidget.h>
#include "Functions.h"

#ifndef NumberConfigWidget_H
#define NumberConfigWidget_H
class NumberConfigWidget : public QWidget, public IConfigWidget
{
	Q_OBJECT
public:
	QLabel * Label;
	QDoubleSpinBox * SpinBox;
	QLabel * UnitLabel;
	double Value;
	double Multiplier;
	void *ConfigValue;
	std::string Type;

	~NumberConfigWidget();

	NumberConfigWidget(const char * name, const char * units, double min, double max, double value, int decimals, double multiplier, std::string type);

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