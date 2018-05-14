#include <string>
#include <QWidget>

#ifndef IConfigWidget_H
#define IConfigWidget_H
class IConfigWidget
{
public:
	virtual void * getValue() = 0;
	virtual void setValue(void *) = 0;
	virtual void * getConfigValue() = 0;
	virtual void setConfigValue(void *) = 0;
	virtual unsigned int configSize() = 0;
	virtual bool isConfigPointer() = 0;
	virtual std::string getConfigType() = 0;
};
#endif