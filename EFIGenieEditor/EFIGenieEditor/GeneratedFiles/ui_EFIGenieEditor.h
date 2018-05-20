/********************************************************************************
** Form generated from reading UI file 'EFIGenieEditor.ui'
**
** Created by: Qt User Interface Compiler version 5.10.1
**
** WARNING! All changes made in this file will be lost when recompiling UI file!
********************************************************************************/

#ifndef UI_EFIGENIEEDITOR_H
#define UI_EFIGENIEEDITOR_H

#include <QtCore/QVariant>
#include <QtWidgets/QAction>
#include <QtWidgets/QApplication>
#include <QtWidgets/QButtonGroup>
#include <QtWidgets/QGridLayout>
#include <QtWidgets/QHeaderView>
#include <QtWidgets/QMainWindow>
#include <QtWidgets/QMdiArea>
#include <QtWidgets/QMenu>
#include <QtWidgets/QMenuBar>
#include <QtWidgets/QStatusBar>
#include <QtWidgets/QToolBar>
#include <QtWidgets/QWidget>

QT_BEGIN_NAMESPACE

class Ui_EFIGenieEditorClass
{
public:
    QAction *actionLoad_Bin;
    QAction *actionSave_Bin;
    QWidget *centralWidget;
    QGridLayout *gridLayout;
    QMdiArea *mainArea;
    QMenuBar *menuBar;
    QMenu *menuFile;
    QToolBar *mainToolBar;
    QStatusBar *statusBar;

    void setupUi(QMainWindow *EFIGenieEditorClass)
    {
        if (EFIGenieEditorClass->objectName().isEmpty())
            EFIGenieEditorClass->setObjectName(QStringLiteral("EFIGenieEditorClass"));
        EFIGenieEditorClass->resize(1366, 454);
        actionLoad_Bin = new QAction(EFIGenieEditorClass);
        actionLoad_Bin->setObjectName(QStringLiteral("actionLoad_Bin"));
        actionSave_Bin = new QAction(EFIGenieEditorClass);
        actionSave_Bin->setObjectName(QStringLiteral("actionSave_Bin"));
        centralWidget = new QWidget(EFIGenieEditorClass);
        centralWidget->setObjectName(QStringLiteral("centralWidget"));
        gridLayout = new QGridLayout(centralWidget);
        gridLayout->setSpacing(6);
        gridLayout->setContentsMargins(11, 11, 11, 11);
        gridLayout->setObjectName(QStringLiteral("gridLayout"));
        mainArea = new QMdiArea(centralWidget);
        mainArea->setObjectName(QStringLiteral("mainArea"));
        QSizePolicy sizePolicy(QSizePolicy::Expanding, QSizePolicy::Expanding);
        sizePolicy.setHorizontalStretch(0);
        sizePolicy.setVerticalStretch(0);
        sizePolicy.setHeightForWidth(mainArea->sizePolicy().hasHeightForWidth());
        mainArea->setSizePolicy(sizePolicy);

        gridLayout->addWidget(mainArea, 0, 0, 1, 1);

        EFIGenieEditorClass->setCentralWidget(centralWidget);
        menuBar = new QMenuBar(EFIGenieEditorClass);
        menuBar->setObjectName(QStringLiteral("menuBar"));
        menuBar->setGeometry(QRect(0, 0, 1366, 26));
        menuFile = new QMenu(menuBar);
        menuFile->setObjectName(QStringLiteral("menuFile"));
        EFIGenieEditorClass->setMenuBar(menuBar);
        mainToolBar = new QToolBar(EFIGenieEditorClass);
        mainToolBar->setObjectName(QStringLiteral("mainToolBar"));
        EFIGenieEditorClass->addToolBar(Qt::TopToolBarArea, mainToolBar);
        statusBar = new QStatusBar(EFIGenieEditorClass);
        statusBar->setObjectName(QStringLiteral("statusBar"));
        EFIGenieEditorClass->setStatusBar(statusBar);

        menuBar->addAction(menuFile->menuAction());
        menuFile->addAction(actionLoad_Bin);
        menuFile->addAction(actionSave_Bin);

        retranslateUi(EFIGenieEditorClass);

        QMetaObject::connectSlotsByName(EFIGenieEditorClass);
    } // setupUi

    void retranslateUi(QMainWindow *EFIGenieEditorClass)
    {
        EFIGenieEditorClass->setWindowTitle(QApplication::translate("EFIGenieEditorClass", "EFIGenieEditor", nullptr));
        actionLoad_Bin->setText(QApplication::translate("EFIGenieEditorClass", "Load Bin", nullptr));
        actionSave_Bin->setText(QApplication::translate("EFIGenieEditorClass", "Save Bin", nullptr));
        menuFile->setTitle(QApplication::translate("EFIGenieEditorClass", "File", nullptr));
    } // retranslateUi

};

namespace Ui {
    class EFIGenieEditorClass: public Ui_EFIGenieEditorClass {};
} // namespace Ui

QT_END_NAMESPACE

#endif // UI_EFIGENIEEDITOR_H
