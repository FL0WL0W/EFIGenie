#include <QWidget>
#include <QLabel>
#include <QDoubleSpinBox>
#include <QGridLayout>
#include <IConfigWidget.h>

#ifndef NumberConfigWidget_H
#define NumberConfigWidget_H
class NumberConfigWidget : public QWidget, public IConfigWidget
{
public:
	QLabel * Label;
	QDoubleSpinBox * SpinBox;
	QLabel * UnitLabel;
	double Value;
	std::string Type;

	NumberConfigWidget(const char * name, const char * units, double min, double max, double value, int decimals, std::string type)
	{
		Type = type;

		QGridLayout *layout = new QGridLayout;
		layout->setSpacing(5);
		layout->setMargin(0);

		Label = new QLabel(QString(name));
		Label->setFixedSize(300, 25);
		layout->addWidget(Label, 0, 0);

		UnitLabel = new QLabel(QString(units));
		UnitLabel->setFixedSize(100, 25);
		layout->addWidget(UnitLabel, 0, 2);

		SpinBox = new QDoubleSpinBox();
		SpinBox->setMinimum(min);
		SpinBox->setMaximum(max);
		SpinBox->setValue(value);
		SpinBox->setFixedSize(100, 25);
		SpinBox->setDecimals(decimals);
		layout->addWidget(SpinBox, 0, 1);
		SpinBox->installEventFilter(this);

		setLayout(layout);
	}

	void * getValue()
	{
		return &Value;
	}

	void setValue(void *val)
	{
		SpinBox->setValue(*((double *)val));
		Value = *((double *)val);
	}

	unsigned int size()
	{
		return SizeOfType(Type);
	}

	bool isPointer()
	{
		return false;
	}

	std::string getType()
	{
		return Type;
	}

	bool eventFilter(QObject *watched, QEvent *e)
	{
		Value = SpinBox->value();
		return false;
	}
};
#endif