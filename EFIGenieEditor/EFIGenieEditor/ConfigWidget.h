#include <string>
#include <vector>
#include <Functions.h>
#include <QGridLayout>
#include <IConfigWidget.h>
#include <vector>
#include <NumberConfigWidget.h>
#include <Table1ConfigWidget.h>
#include <Table2ConfigWidget.h>


#ifndef ConfigWidget_H
#define ConfigWidget_H
class ConfigWidget : public QWidget, public IConfigWidget
{
public:
	std::vector<std::pair<std::string, IConfigWidget *>> Widgets;

	ConfigWidget(std::string definition)
	{
		std::vector<std::string> lines = Split(definition, '\n');

		QGridLayout *layout = new QGridLayout;

		for (int i = 0; i < lines.size(); ++i)
		{
			std::vector<std::string> params = Split(lines[i], ' ');
			if (params[0] == "uint8"
				|| params[0] == "int8"
				|| params[0] == "uint16"
				|| params[0] == "int16"
				|| params[0] == "uint32"
				|| params[0] == "int32"
				|| params[0] == "uint64"
				|| params[0] == "int64")
			{
				NumberConfigWidget * widget = new NumberConfigWidget(params[1].c_str(), params[2].c_str(), atof(params[3].c_str()), atof(params[5].c_str()), atof(params[4].c_str()), 0, params[0]);

				Widgets.push_back(std::pair<std::string, IConfigWidget *>(params[1], widget));

				layout->addWidget(widget, i, 0);
			}
			else if (Split(params[0], '_')[0] == "float32" || Split(params[0], '_')[0] == "float64")
			{
				NumberConfigWidget * widget = new NumberConfigWidget(params[1].c_str(), params[2].c_str(), atof(params[3].c_str()), atof(params[5].c_str()), atof(params[4].c_str()), atoi(Split(params[0], '_')[1].c_str()), params[0]);

				Widgets.push_back(std::pair<std::string, IConfigWidget *>(params[1], widget));

				layout->addWidget(widget, i, 0);
			}
			else if (Split(params[0], '[').size() > 1)
			{
				std::vector<std::string> xBounds = Split(Split(Split(params[0], '[')[1], ']')[0], ':');
				double *xMin = 0;
				double *xRes = 0;
				double *xMax = 0;
				if (xBounds.size() > 3)
				{
					for (std::pair<std::string, IConfigWidget *> widget : Widgets)
					{
						if (widget.first == xBounds[0])
							xMin = (double *)widget.second->getValue();
						if (widget.first == xBounds[1])
							xRes = (double *)widget.second->getValue();
						if (widget.first == xBounds[2])
							xMax = (double *)widget.second->getValue();
					}

					if (xMin == 0)
					{
						xMin = (double*)malloc(sizeof(double));
						double buff = atof(xBounds[0].c_str());
						CopyNumberToLocation<double>((void*)xMin, (void*)&buff);
					}
					if (xRes == 0)
					{
						xRes = (double*)malloc(sizeof(double));
						double buff = atoi(xBounds[1].c_str());
						CopyNumberToLocation<double>((void*)xRes, (void*)&buff);
					}
					if (xMax == 0)
					{
						xMax = (double*)malloc(sizeof(double));
						double buff = atof(xBounds[3].c_str());
						CopyNumberToLocation<double>((void*)xMax, (void*)&buff);
					}
				}

				if (Split(params[0], '[').size() == 3)
				{
					std::vector<std::string> yBounds = Split(Split(Split(params[0], '[')[1], ']')[0], ':');
					double *yMin = 0;
					double *yRes = 0;
					double *yMax = 0;
					if (yBounds.size() > 3)
					{
						for (std::pair<std::string, IConfigWidget *> widget : Widgets)
						{
							if (widget.first == yBounds[0])
								yMin = (double *)widget.second->getValue();
							if (widget.first == yBounds[1])
								yRes = (double *)widget.second->getValue();
							if (widget.first == yBounds[2])
								yMax = (double *)widget.second->getValue();
						}

						if (yMin == 0)
						{
							yMin = (double*)malloc(sizeof(double));
							double buff = atof(yBounds[0].c_str());
							CopyNumberToLocation<double>((void*)yMin, (void*)&buff);
						}
						if (yRes == 0)
						{
							yRes = (double*)malloc(sizeof(double));
							double buff = atoi(yBounds[1].c_str());
							CopyNumberToLocation<double>((void*)yRes, (void*)&buff);
						}
						if (yMax == 0)
						{
							yMax = (double*)malloc(sizeof(double));
							double buff = atof(yBounds[3].c_str());
							CopyNumberToLocation<double>((void*)yMax, (void*)&buff);
						}

					}

					Table2ConfigWidget * widget = new Table2ConfigWidget(params[1].c_str(), params[0], xMin, xRes, xMax, yMin, yRes, yMax);

					Widgets.push_back(std::pair<std::string, IConfigWidget *>(params[1], widget));

					layout->addWidget(widget, i, 0);
				}
				else
				{
					Table1ConfigWidget * widget = new Table1ConfigWidget(params[1].c_str(), params[0], xMin, xRes, xMax);

					Widgets.push_back(std::pair<std::string, IConfigWidget *>(params[1], widget));

					layout->addWidget(widget, i, 0);
				}

			}
		}

		setLayout(layout);
	}
	
	void * getValue()
	{
		void * val = malloc(size());
		void * buildVal = val;
		for (std::pair<std::string, IConfigWidget *> widget : Widgets)
		{
			if (widget.second->isPointer())
				buildVal = (void *)((unsigned int)buildVal + 1);
			else
			{
				if (widget.second->getType() == "uint8")
					CopyNumberToLocation<unsigned char>(buildVal, widget.second->getValue());
				if (widget.second->getType() == "int8")
					CopyNumberToLocation<char>(buildVal, widget.second->getValue());
				if (widget.second->getType() == "uint16")
					CopyNumberToLocation<unsigned short>(buildVal, widget.second->getValue());
				if (widget.second->getType() == "int16")
					CopyNumberToLocation<short>(buildVal, widget.second->getValue());
				if (widget.second->getType() == "uint32")
					CopyNumberToLocation<unsigned int>(buildVal, widget.second->getValue());
				if (widget.second->getType() == "int32")
					CopyNumberToLocation<int>(buildVal, widget.second->getValue());
				if (widget.second->getType() == "uint64")
					CopyNumberToLocation<unsigned long>(buildVal, widget.second->getValue());
				if (widget.second->getType() == "int64")
					CopyNumberToLocation<long>(buildVal, widget.second->getValue());
				if (widget.second->getType() == "float32")
					CopyNumberToLocation<float>(buildVal, widget.second->getValue());
				if (widget.second->getType() == "float64")
					CopyNumberToLocation<double>(buildVal, widget.second->getValue());

				buildVal = (void *)((unsigned char)buildVal + widget.second->size());
			}
		}
		for (std::pair<std::string, IConfigWidget *> widget : Widgets)
		{
			if (widget.second->isPointer())
			{
				memcpy(buildVal, widget.second->getValue(), widget.second->size());

				buildVal = (void *)((unsigned char)buildVal + widget.second->size());
			}
		}

		return val;
	}

	void setValue(void *val)
	{
		void * buildVal = val;
		for (std::pair<std::string, IConfigWidget *> widget : Widgets)
		{
			if (widget.second->isPointer())
				buildVal = (void *)((unsigned int)buildVal + 1);
			else
			{
				widget.second->setValue(buildVal);

				buildVal = (void *)((unsigned char)buildVal + widget.second->size());
			}
		}
		for (std::pair<std::string, IConfigWidget *> widget : Widgets)
		{
			if (widget.second->isPointer())
			{
				widget.second->setValue(buildVal);

				buildVal = (void *)((unsigned char)buildVal + widget.second->size());
			}
		}
	}

	unsigned int size()
	{
		unsigned int size = 0;
		for (std::pair<std::string, IConfigWidget *> widget : Widgets)
		{
			if(widget.second->isPointer())
				size += sizeof(unsigned int);

			size += widget.second->size();
		}

		return size;
	}

	bool isPointer()
	{
		return true;
	}

	std::string getType()
	{
		return "";
	}
};
#endif
