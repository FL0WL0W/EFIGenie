#include <string>
#include <vector>
#include <Functions.h>
#include <QGridLayout>
#include <QComboBox>
#include <IConfigWidget.h>
#include <vector>
#include <NumberConfigWidget.h>
#include <Table1ConfigWidget.h>
#include <Table2ConfigWidget.h>
#include <ConfigSelectorWidget.h>
#include <EFIGenieEditor.h>

#ifndef ConfigDialogWidget_H
#define ConfigDialogWidget_H
class ConfigDialogWidget : public QWidget, public IConfigWidget
{
	Q_OBJECT
public slots:
	void edit();
	void checkedStateChanged(int);
public:
	QLabel * Label;
	QPushButton * Button;
	ConfigSelectorWidget *configSelectorWidget = 0;
	QGridLayout *layout = new QGridLayout;
	QMdiSubWindow *dialog;
	QCheckBox *CheckBox;
	unsigned short ServiceId;
	bool IsConfigPointer;
	bool EnableDisable;

	ConfigDialogWidget(const char * label, int serviceId, bool isConfigPointer, bool isStatic, bool enableDisable, std::map<int, std::map<unsigned char, std::pair<std::string, std::string>>> definitions);
	
	void * getValue();

	void setValue(void *);

	void * getConfigValue();

	void setConfigValue(void *val);

	unsigned int configSize();

	bool isConfigPointer();

	std::string getConfigType();
};
#endif
