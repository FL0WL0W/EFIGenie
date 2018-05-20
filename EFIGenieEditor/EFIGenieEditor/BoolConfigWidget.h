#include <QWidget>
#include <QLabel>
#include <QCheckBox>
#include <QGridLayout>
#include <IConfigWidget.h>
#include "Functions.h"

#ifndef BoolConfigWidget_H
#define BoolConfigWidget_H
class BoolConfigWidget : public QWidget, public IConfigWidget
{
	Q_OBJECT
public:
	QLabel * Label;
	QCheckBox * CheckBox;
	
	BoolConfigWidget(const char * name, bool value);

	void * getValue();

	void setValue(void *val);

	void * getConfigValue();

	void setConfigValue(void *val);

	unsigned int configSize();

	bool isConfigPointer();

	std::string getConfigType();
};
#endif